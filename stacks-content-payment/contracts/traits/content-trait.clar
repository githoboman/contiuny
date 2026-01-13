;; Content Trait
;; Standard interface for content-related contracts

(define-trait content-trait
  (
    ;; Check if user has access to content
    (has-access (principal uint) (response bool uint))
    
    ;; Get content information
    (get-content-info (uint) (response 
      {
        creator: principal,
        price-stx: uint,
        is-active: bool
      } 
      uint))
    
    ;; Process payment for content
    (pay-for-content-stx (uint) (response bool uint))
  )
)
