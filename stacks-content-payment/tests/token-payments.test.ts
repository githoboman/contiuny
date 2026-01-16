import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const user = accounts.get("wallet_2")!;
const user2 = accounts.get("wallet_3")!;

describe("SIP-010 Token Payment Tests", () => {
    beforeEach(() => {
        // Mint mock USDC to users for testing
        simnet.callPublicFn(
            "mock-usdc",
            "mint",
            [Cl.uint(10000000000), Cl.principal(user)], // 10,000 USDC (6 decimals)
            deployer
        );

        simnet.callPublicFn(
            "mock-usdc",
            "mint",
            [Cl.uint(10000000000), Cl.principal(user2)],
            deployer
        );
    });

    describe("Token Registration", () => {
        it("should register content with token pricing", () => {
            const tokenContract = `${deployer}.mock-usdc`;

            const result = simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmTokenContent123"),
                    Cl.uint(1000000), // 1 STX
                    Cl.uint(5000000), // 5 USDC
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/token-content.json")
                ],
                creator
            );

            expect(result.result).toBeOk(Cl.uint(1));
        });

        it("should store token contract address", () => {
            const tokenContract = `${deployer}.mock-usdc`;

            simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmTokenContent123"),
                    Cl.uint(1000000),
                    Cl.uint(5000000),
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/token-content.json")
                ],
                creator
            );

            const contentInfo = simnet.callReadOnlyFn(
                "content-registry",
                "get-content-info",
                [Cl.uint(1)],
                creator
            );

            expect(contentInfo.result).toBeSome(
                Cl.tuple({
                    creator: Cl.principal(creator),
                    "ipfs-hash": Cl.stringAscii("QmTokenContent123"),
                    "price-stx": Cl.uint(1000000),
                    "price-token": Cl.some(Cl.uint(5000000)),
                    "token-contract": Cl.some(Cl.principal(tokenContract)),
                    "metadata-uri": Cl.stringUtf8("https://example.com/token-content.json"),
                    "created-at": Cl.uint(simnet.blockHeight),
                    "is-active": Cl.bool(true)
                })
            );
        });

        it("should reject zero token price", () => {
            const tokenContract = `${deployer}.mock-usdc`;

            const result = simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmTokenContent123"),
                    Cl.uint(1000000),
                    Cl.uint(0), // Invalid: zero price
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/token-content.json")
                ],
                creator
            );

            expect(result.result).toBeErr(Cl.uint(104)); // err-invalid-price
        });
    });

    describe("Token Payment Processing", () => {
        beforeEach(() => {
            // Register content with token pricing
            const tokenContract = `${deployer}.mock-usdc`;
            simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmTokenContent123"),
                    Cl.uint(1000000),
                    Cl.uint(5000000), // 5 USDC
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/token-content.json")
                ],
                creator
            );
        });

        it("should process token payment successfully", () => {

            const result = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should transfer tokens to creator", () => {

            // Get balances before
            const creatorBalanceBefore = simnet.callReadOnlyFn(
                "mock-usdc",
                "get-balance",
                [Cl.principal(creator)],
                creator
            );

            const userBalanceBefore = simnet.callReadOnlyFn(
                "mock-usdc",
                "get-balance",
                [Cl.principal(user)],
                user
            );

            // Make payment
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            // Get balances after
            const creatorBalanceAfter = simnet.callReadOnlyFn(
                "mock-usdc",
                "get-balance",
                [Cl.principal(creator)],
                creator
            );

            const userBalanceAfter = simnet.callReadOnlyFn(
                "mock-usdc",
                "get-balance",
                [Cl.principal(user)],
                user
            );

            // Verify transfer - extract uint from (ok uint) responses
            // get-balance returns (ok uint), extract the bigint value directly
            // The result structure is: { type: 'ok', value: { type: 'uint', value: bigint } }
            const creatorBefore = (creatorBalanceBefore.result as any).value.value;
            const creatorAfter = (creatorBalanceAfter.result as any).value.value;
            const userBefore = (userBalanceBefore.result as any).value.value;
            const userAfter = (userBalanceAfter.result as any).value.value;

            // Verify creator received 5 USDC and user paid 5 USDC
            expect(creatorAfter - creatorBefore).toBe(5000000n);
            expect(userBefore - userAfter).toBe(5000000n);
        });

        it("should grant access after token payment", () => {

            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            const hasAccess = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            expect(hasAccess.result).toStrictEqual(Cl.bool(true));
        });

        it("should prevent duplicate token payment", () => {

            // First payment
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            // Second payment attempt
            const result = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            expect(result.result).toBeErr(Cl.uint(202)); // err-already-paid
        });

        it("should reject payment with wrong token contract", () => {
            // Try to pay with a different token contract
            const result = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "content-registry") // Wrong contract
                ],
                user
            );

            expect(result.result).toBeErr(Cl.uint(207)); // err-token-mismatch
        });

        it("should fail for content without token pricing", () => {
            // Register STX-only content
            simnet.callPublicFn(
                "content-registry",
                "register-content",
                [
                    Cl.stringAscii("QmSTXOnly"),
                    Cl.uint(1000000),
                    Cl.stringUtf8("https://example.com/stx-only.json")
                ],
                creator
            );

            // Try to pay with tokens
            const result = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(2),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            expect(result.result).toBeErr(Cl.uint(206)); // err-no-token-price
        });

        it("should create payment receipt for token payment", () => {

            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            const receipt = simnet.callReadOnlyFn(
                "payment-handler",
                "get-payment-receipt",
                [Cl.uint(1)],
                user
            );

            expect(receipt.result).toBeSome(
                Cl.tuple({
                    user: Cl.principal(user),
                    "content-id": Cl.uint(1),
                    amount: Cl.uint(5000000),
                    timestamp: Cl.uint(simnet.blockHeight),
                    "tx-sender": Cl.principal(user)
                })
            );
        });
    });

    describe("Multiple Token Payments", () => {
        beforeEach(() => {
            const tokenContract = `${deployer}.mock-usdc`;

            // Register multiple content with token pricing
            simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmContent1"),
                    Cl.uint(1000000),
                    Cl.uint(5000000),
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/content1.json")
                ],
                creator
            );

            simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmContent2"),
                    Cl.uint(2000000),
                    Cl.uint(10000000),
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/content2.json")
                ],
                creator
            );
        });

        it("should handle multiple users paying with tokens", () => {

            // User 1 pays
            const result1 = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            // User 2 pays
            const result2 = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user2
            );

            expect(result1.result).toBeOk(Cl.bool(true));
            expect(result2.result).toBeOk(Cl.bool(true));

            // Both should have access
            const access1 = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            const access2 = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user2), Cl.uint(1)],
                user2
            );

            expect(access1.result).toStrictEqual(Cl.bool(true));
            expect(access2.result).toStrictEqual(Cl.bool(true));
        });

        it("should handle user purchasing multiple content with tokens", () => {

            // Pay for content 1
            const result1 = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(1),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            // Pay for content 2
            const result2 = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(2),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            expect(result1.result).toBeOk(Cl.bool(true));
            expect(result2.result).toBeOk(Cl.bool(true));

            // Should have access to both
            const access1 = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            const access2 = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(2)],
                user
            );

            expect(access1.result).toStrictEqual(Cl.bool(true));
            expect(access2.result).toStrictEqual(Cl.bool(true));
        });
    });

    describe("Mixed Payment Methods", () => {
        it("should support both STX and token payments for same creator", () => {
            const tokenContract = `${deployer}.mock-usdc`;

            // Register STX-only content
            simnet.callPublicFn(
                "content-registry",
                "register-content",
                [
                    Cl.stringAscii("QmSTXContent"),
                    Cl.uint(1000000),
                    Cl.stringUtf8("https://example.com/stx.json")
                ],
                creator
            );

            // Register token-enabled content
            simnet.callPublicFn(
                "content-registry",
                "register-content-with-token",
                [
                    Cl.stringAscii("QmTokenContent"),
                    Cl.uint(1000000),
                    Cl.uint(5000000),
                    Cl.principal(tokenContract),
                    Cl.stringUtf8("https://example.com/token.json")
                ],
                creator
            );

            // Pay for STX content with STX
            const stxResult = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            // Pay for token content with tokens
            const tokenResult = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-token",
                [
                    Cl.uint(2),
                    Cl.contractPrincipal(deployer, "mock-usdc")
                ],
                user
            );

            expect(stxResult.result).toBeOk(Cl.bool(true));
            expect(tokenResult.result).toBeOk(Cl.bool(true));
        });
    });
});
