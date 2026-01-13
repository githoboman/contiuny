;; Content Registry Contract
;; Manages content metadata, pricing, and ownership
;; Clarity Version 2 (compatible with Stacks testnet)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-price-too-low (err u105))

;; Data Variables
(define-data-var content-id-nonce uint u0)

;; Data Maps
(define-map content-metadata
  { content-id: uint }
  {
    creator: principal,
    ipfs-hash: (string-ascii 64),
    price-stx: uint,
    price-token: (optional uint),
    token-contract: (optional principal),
    metadata-uri: (string-utf8 256),
    created-at: uint,
    is-active: bool
  }
)

(define-map creator-contents
  { creator: principal, index: uint }
  { content-id: uint }
)

(define-map creator-content-count
  { creator: principal }
  { count: uint }
)

;; Public Functions

;; Register new content with STX pricing
(define-public (register-content 
  (ipfs-hash (string-ascii 64))
  (price-stx uint)
  (metadata-uri (string-utf8 256)))
  (let
    (
      (new-id (+ (var-get content-id-nonce) u1))
      (creator tx-sender)
      (creator-count (default-to u0 (get count (map-get? creator-content-count { creator: creator }))))
    )
    ;; Validate price
    (asserts! (> price-stx u0) err-invalid-price)
    
    ;; Store content metadata
    (map-set content-metadata
      { content-id: new-id }
      {
        creator: creator,
        ipfs-hash: ipfs-hash,
        price-stx: price-stx,
        price-token: none,
        token-contract: none,
        metadata-uri: metadata-uri,
        created-at: block-height,
        is-active: true
      }
    )
    
    ;; Index by creator
    (map-set creator-contents
      { creator: creator, index: creator-count }
      { content-id: new-id }
    )
    
    ;; Update creator count
    (map-set creator-content-count
      { creator: creator }
      { count: (+ creator-count u1) }
    )
    
    ;; Increment nonce
    (var-set content-id-nonce new-id)
    
    ;; Print event
    (print {
      event: "content-registered",
      content-id: new-id,
      creator: creator,
      price: price-stx
    })
    
    (ok new-id)
  )
)

;; Register new content with SIP-010 token pricing (xUSDC, ALEX, etc.)
(define-public (register-content-with-token
  (ipfs-hash (string-ascii 64))
  (price-stx uint)
  (price-token uint)
  (token-contract principal)
  (metadata-uri (string-utf8 256)))
  (let
    (
      (new-id (+ (var-get content-id-nonce) u1))
      (creator tx-sender)
      (creator-count (default-to u0 (get count (map-get? creator-content-count { creator: creator }))))
    )
    ;; Validate prices
    (asserts! (> price-stx u0) err-invalid-price)
    (asserts! (> price-token u0) err-invalid-price)
    
    ;; Store content metadata with token info
    (map-set content-metadata
      { content-id: new-id }
      {
        creator: creator,
        ipfs-hash: ipfs-hash,
        price-stx: price-stx,
        price-token: (some price-token),
        token-contract: (some token-contract),
        metadata-uri: metadata-uri,
        created-at: block-height,
        is-active: true
      }
    )
    
    ;; Index by creator
    (map-set creator-contents
      { creator: creator, index: creator-count }
      { content-id: new-id }
    )
    
    ;; Update creator count
    (map-set creator-content-count
      { creator: creator }
      { count: (+ creator-count u1) }
    )
    
    ;; Increment nonce
    (var-set content-id-nonce new-id)
    
    ;; Print event
    (print {
      event: "content-registered-with-token",
      content-id: new-id,
      creator: creator,
      price-stx: price-stx,
      price-token: price-token,
      token-contract: token-contract
    })
    
    (ok new-id)
  )
)


;; Update content price (creator only)
(define-public (update-price
  (content-id uint)
  (new-price uint))
  (let
    (
      (content (unwrap! (map-get? content-metadata { content-id: content-id }) err-not-found))
    )
    ;; Verify caller is creator
    (asserts! (is-eq tx-sender (get creator content)) err-unauthorized)
    
    ;; Validate new price
    (asserts! (> new-price u0) err-price-too-low)
    
    ;; Update price
    (map-set content-metadata
      { content-id: content-id }
      (merge content { price-stx: new-price })
    )
    
    ;; Print event
    (print {
      event: "price-updated",
      content-id: content-id,
      old-price: (get price-stx content),
      new-price: new-price
    })
    
    (ok true)
  )
)

;; Deactivate content (creator only)
(define-public (deactivate-content
  (content-id uint))
  (let
    (
      (content (unwrap! (map-get? content-metadata { content-id: content-id }) err-not-found))
    )
    ;; Verify caller is creator
    (asserts! (is-eq tx-sender (get creator content)) err-unauthorized)
    
    ;; Deactivate
    (map-set content-metadata
      { content-id: content-id }
      (merge content { is-active: false })
    )
    
    ;; Print event
    (print {
      event: "content-deactivated",
      content-id: content-id
    })
    
    (ok true)
  )
)

;; Reactivate content (creator only)
(define-public (reactivate-content
  (content-id uint))
  (let
    (
      (content (unwrap! (map-get? content-metadata { content-id: content-id }) err-not-found))
    )
    ;; Verify caller is creator
    (asserts! (is-eq tx-sender (get creator content)) err-unauthorized)
    
    ;; Reactivate
    (map-set content-metadata
      { content-id: content-id }
      (merge content { is-active: true })
    )
    
    ;; Print event
    (print {
      event: "content-reactivated",
      content-id: content-id
    })
    
    (ok true)
  )
)

;; Read-only Functions

;; Get content information
(define-read-only (get-content-info (content-id uint))
  (map-get? content-metadata { content-id: content-id })
)

;; Get content price
(define-read-only (get-content-price (content-id uint))
  (match (map-get? content-metadata { content-id: content-id })
    content (ok (get price-stx content))
    err-not-found
  )
)

;; Get creator's content count
(define-read-only (get-creator-content-count (creator principal))
  (default-to u0 (get count (map-get? creator-content-count { creator: creator })))
)

;; Get creator's content by index
(define-read-only (get-creator-content (creator principal) (index uint))
  (map-get? creator-contents { creator: creator, index: index })
)

;; Get total content count
(define-read-only (get-total-content-count)
  (ok (var-get content-id-nonce))
)

;; Check if content is active
(define-read-only (is-content-active (content-id uint))
  (match (map-get? content-metadata { content-id: content-id })
    content (ok (get is-active content))
    err-not-found
  )
)
