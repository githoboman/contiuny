;; Mock SIP-010 Token for Testing
;; Implements the SIP-010 fungible token trait
;; Used for testing xUSDC and other token payments

(impl-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))

;; Token configuration
(define-constant token-name "Mock USDC")
(define-constant token-symbol "mUSDC")
(define-constant token-decimals u6) ;; USDC has 6 decimals
(define-constant token-uri u"https://example.com/mock-usdc.json")

;; Data Variables
(define-data-var total-supply uint u0)

;; Data Maps
(define-map balances principal uint)

;; SIP-010 Functions

;; Transfer tokens
(define-public (transfer 
  (amount uint)
  (sender principal)
  (recipient principal)
  (memo (optional (buff 34))))
  (begin
    ;; Verify sender is tx-sender or contract-caller
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
    
    ;; Transfer using built-in ft-transfer
    (try! (ft-transfer? mock-usdc amount sender recipient))
    
    ;; Print transfer event
    (print { 
      event: "transfer", 
      sender: sender, 
      recipient: recipient, 
      amount: amount 
    })
    
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok token-name)
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok token-symbol)
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok token-decimals)
)

;; Get balance of an account
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance mock-usdc account))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-usdc))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (some token-uri))
)

;; Additional helper functions for testing

;; Mint tokens (for testing only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (ft-mint? mock-usdc amount recipient))
    (print { event: "mint", recipient: recipient, amount: amount })
    (ok true)
  )
)

;; Define the fungible token
(define-fungible-token mock-usdc)
