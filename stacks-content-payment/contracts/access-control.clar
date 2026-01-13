;; Access Control Contract
;; Manages time-based access and subscriptions
;; Clarity Version 2 (compatible with Stacks testnet)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-access-denied (err u300))
(define-constant err-expired (err u301))
(define-constant err-not-authorized (err u302))
(define-constant err-content-not-found (err u303))
(define-constant err-invalid-duration (err u304))
(define-constant err-subscription-not-found (err u305))

;; Data Variables
(define-data-var platform-fee-percentage uint u250) ;; 2.5% (250 basis points)

;; Data Maps

;; Time-based access grants
(define-map time-based-access
  { user: principal, content-id: uint }
  {
    granted-at: uint,
    expires-at: uint,
    renewable: bool,
    granted-by: principal
  }
)

;; Subscription tiers
(define-map subscriptions
  { user: principal, creator: principal }
  {
    tier: uint,
    started-at: uint,
    expires-at: uint,
    auto-renew: bool,
    price-per-period: uint
  }
)

;; Creator subscription tiers
(define-map creator-tiers
  { creator: principal, tier: uint }
  {
    name: (string-utf8 64),
    price: uint,
    duration-blocks: uint,
    benefits: (string-utf8 256)
  }
)

;; Public Functions

;; Grant timed access to content (creator only)
(define-public (grant-timed-access
  (user principal)
  (content-id uint)
  (duration uint))
  (let
    (
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) err-content-not-found))
      (creator (get creator content-info))
    )
    ;; Verify caller is creator
    (asserts! (is-eq tx-sender creator) err-not-authorized)
    
    ;; Validate duration
    (asserts! (> duration u0) err-invalid-duration)
    
    ;; Grant access
    (map-set time-based-access
      { user: user, content-id: content-id }
      {
        granted-at: block-height,
        expires-at: (+ block-height duration),
        renewable: true,
        granted-by: creator
      }
    )
    
    ;; Print event
    (print {
      event: "timed-access-granted",
      user: user,
      content-id: content-id,
      duration: duration,
      expires-at: (+ block-height duration)
    })
    
    (ok true)
  )
)

;; Revoke access (creator only)
(define-public (revoke-access
  (user principal)
  (content-id uint))
  (let
    (
      (content-info (unwrap! (contract-call? .content-registry get-content-info content-id) err-content-not-found))
      (creator (get creator content-info))
    )
    ;; Verify caller is creator
    (asserts! (is-eq tx-sender creator) err-not-authorized)
    
    ;; Revoke access
    (map-delete time-based-access { user: user, content-id: content-id })
    
    ;; Print event
    (print {
      event: "access-revoked",
      user: user,
      content-id: content-id
    })
    
    (ok true)
  )
)

;; Create subscription tier (creator only)
(define-public (create-subscription-tier
  (tier uint)
  (name (string-utf8 64))
  (price uint)
  (duration-blocks uint)
  (benefits (string-utf8 256)))
  (begin
    ;; Validate inputs
    (asserts! (> price u0) (err u306))
    (asserts! (> duration-blocks u0) err-invalid-duration)
    
    ;; Create tier
    (map-set creator-tiers
      { creator: tx-sender, tier: tier }
      {
        name: name,
        price: price,
        duration-blocks: duration-blocks,
        benefits: benefits
      }
    )
    
    ;; Print event
    (print {
      event: "subscription-tier-created",
      creator: tx-sender,
      tier: tier,
      price: price
    })
    
    (ok true)
  )
)

;; Subscribe to creator (user pays)
(define-public (subscribe-to-creator
  (creator principal)
  (tier uint))
  (let
    (
      (tier-info (unwrap! (map-get? creator-tiers { creator: creator, tier: tier }) err-subscription-not-found))
      (price (get price tier-info))
      (duration (get duration-blocks tier-info))
      (user tx-sender)
    )
    ;; Transfer STX to creator
    (try! (stx-transfer? price user creator))
    
    ;; Create subscription
    (map-set subscriptions
      { user: user, creator: creator }
      {
        tier: tier,
        started-at: block-height,
        expires-at: (+ block-height duration),
        auto-renew: false,
        price-per-period: price
      }
    )
    
    ;; Print event
    (print {
      event: "subscription-created",
      user: user,
      creator: creator,
      tier: tier,
      expires-at: (+ block-height duration)
    })
    
    (ok true)
  )
)

;; Update platform fee (contract owner only)
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (<= new-fee u1000) (err u307)) ;; Max 10%
    (var-set platform-fee-percentage new-fee)
    (ok true)
  )
)

;; Read-only Functions

;; Check if user has timed access
(define-read-only (check-access (user principal) (content-id uint))
  (match (map-get? time-based-access { user: user, content-id: content-id })
    access-info 
      (if (< block-height (get expires-at access-info))
        (ok true)
        err-expired
      )
    err-access-denied
  )
)

;; Get timed access details
(define-read-only (get-timed-access (user principal) (content-id uint))
  (map-get? time-based-access { user: user, content-id: content-id })
)

;; Get subscription details
(define-read-only (get-subscription (user principal) (creator principal))
  (map-get? subscriptions { user: user, creator: creator })
)

;; Check if subscription is active
(define-read-only (is-subscription-active (user principal) (creator principal))
  (match (map-get? subscriptions { user: user, creator: creator })
    sub-info
      (ok (< block-height (get expires-at sub-info)))
    (ok false)
  )
)

;; Get creator tier info
(define-read-only (get-creator-tier (creator principal) (tier uint))
  (map-get? creator-tiers { creator: creator, tier: tier })
)

;; Get platform fee percentage
(define-read-only (get-platform-fee-percentage)
  (ok (var-get platform-fee-percentage))
)
