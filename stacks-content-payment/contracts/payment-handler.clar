;; Payment Handler Contract
;; Processes payments and grants access to content
;; Clarity Version 2 (compatible with Stacks testnet)

;; Dependencies
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-insufficient-payment (err u200))
(define-constant err-payment-failed (err u201))
(define-constant err-already-paid (err u202))
(define-constant err-content-not-found (err u203))
(define-constant err-content-inactive (err u204))
(define-constant err-invalid-content (err u205))

;; Data Maps

;; Track user access to content
(define-map user-access
  { user: principal, content-id: uint }
  {
    paid-amount: uint,
    purchased-at: uint,
    expires-at: (optional uint)
  }
)

;; Payment receipts for audit trail
(define-map payment-receipts
  { receipt-id: uint }
  {
    user: principal,
    content-id: uint,
    amount: uint,
    timestamp: uint,
    tx-sender: principal
  }
)

;; Receipt counter
(define-data-var receipt-nonce uint u0)

;; Public Functions

;; Pay for content with STX
(define-public (pay-for-content-stx (content-id uint))
  (let
    (
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) err-content-not-found))
      (price (get price-stx content-info))
      (creator (get creator content-info))
      (user tx-sender)
      (receipt-id (+ (var-get receipt-nonce) u1))
    )
    ;; Validations
    (asserts! (get is-active content-info) err-content-inactive)
    (asserts! (is-none (map-get? user-access { user: user, content-id: content-id })) err-already-paid)
    (asserts! (> price u0) err-invalid-content)
    
    ;; Transfer STX to creator
    (try! (stx-transfer? price user creator))
    
    ;; Grant access
    (map-set user-access
      { user: user, content-id: content-id }
      {
        paid-amount: price,
        purchased-at: block-height,
        expires-at: none
      }
    )
    
    ;; Store receipt
    (map-set payment-receipts
      { receipt-id: receipt-id }
      {
        user: user,
        content-id: content-id,
        amount: price,
        timestamp: block-height,
        tx-sender: user
      }
    )
    
    ;; Increment receipt counter
    (var-set receipt-nonce receipt-id)
    
    ;; Print event
    (print {
      event: "payment-processed",
      user: user,
      content-id: content-id,
      amount: price,
      creator: creator,
      receipt-id: receipt-id
    })
    
    (ok true)
  )
)

;; Pay for content with SIP-010 token (xUSDC, ALEX, etc.)
(define-public (pay-for-content-token 
  (content-id uint)
  (token-contract <sip-010-trait>))
  (let
    (
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) err-content-not-found))
      (price-token-opt (get price-token content-info))
      (price (unwrap! price-token-opt (err u206))) ;; err-no-token-price
      (creator (get creator content-info))
      (user tx-sender)
      (receipt-id (+ (var-get receipt-nonce) u1))
    )
    ;; Validations
    (asserts! (get is-active content-info) err-content-inactive)
    (asserts! (is-none (map-get? user-access { user: user, content-id: content-id })) err-already-paid)
    (asserts! (> price u0) err-invalid-content)
    
    ;; Verify token contract matches registered contract
    (asserts! 
      (is-eq 
        (some (contract-of token-contract))
        (get token-contract content-info)
      )
      (err u207) ;; err-token-mismatch
    )
    
    ;; Transfer tokens to creator using SIP-010 transfer
    (try! (contract-call? token-contract transfer price user creator none))
    
    ;; Grant access
    (map-set user-access
      { user: user, content-id: content-id }
      {
        paid-amount: price,
        purchased-at: block-height,
        expires-at: none
      }
    )
    
    ;; Store receipt
    (map-set payment-receipts
      { receipt-id: receipt-id }
      {
        user: user,
        content-id: content-id,
        amount: price,
        timestamp: block-height,
        tx-sender: user
      }
    )
    
    ;; Increment receipt counter
    (var-set receipt-nonce receipt-id)
    
    ;; Print event
    (print {
      event: "token-payment-processed",
      user: user,
      content-id: content-id,
      amount: price,
      creator: creator,
      token-contract: (contract-of token-contract),
      receipt-id: receipt-id
    })
    
    (ok true)
  )
)

;; Read-only Functions

;; Check if user has access to content
(define-read-only (has-access (user principal) (content-id uint))
  (is-some (map-get? user-access { user: user, content-id: content-id }))
)

;; Get user access details
(define-read-only (get-user-access (user principal) (content-id uint))
  (map-get? user-access { user: user, content-id: content-id })
)

;; Get payment receipt
(define-read-only (get-payment-receipt (receipt-id uint))
  (map-get? payment-receipts { receipt-id: receipt-id })
)

;; Get total receipts count
(define-read-only (get-total-receipts)
  (ok (var-get receipt-nonce))
)

;; Verify access with expiration check
(define-read-only (verify-access (user principal) (content-id uint))
  (match (map-get? user-access { user: user, content-id: content-id })
    access-info
      (match (get expires-at access-info)
        expiry
          (if (<= block-height expiry)
            (ok true)
            (ok false)
          )
        (ok true) ;; No expiration, permanent access
      )
    (ok false) ;; No access record
  )
)
