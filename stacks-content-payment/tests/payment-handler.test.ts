import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const user = accounts.get("wallet_2")!;

describe("Payment Handler Contract Tests", () => {
    beforeEach(() => {
        simnet.setEpoch("2.5");

        // Register content for testing
        simnet.callPublicFn(
            "content-registry",
            "register-content",
            [
                Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
                Cl.uint(1000000), // 1 STX
                Cl.stringUtf8("https://example.com/metadata.json"),
            ],
            creator
        );
    });

    describe("STX Payment Processing", () => {
        it("should process payment successfully", () => {
            const { result } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should grant access after payment", () => {
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            expect(result).toStrictEqual(Cl.bool(true));
        });

        it("should prevent duplicate payment", () => {
            // First payment
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            // Second payment should fail
            const { result } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            expect(result).toBeErr(Cl.uint(202)); // err-already-paid
        });

        it("should fail for non-existent content", () => {
            const { result } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(999)],
                user
            );

            expect(result).toBeErr(Cl.uint(203)); // err-content-not-found
        });

        it("should fail for inactive content", () => {
            // Deactivate content
            simnet.callPublicFn(
                "content-registry",
                "deactivate-content",
                [Cl.uint(1)],
                creator
            );

            // Try to pay
            const { result } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            expect(result).toBeErr(Cl.uint(204)); // err-content-inactive
        });

        it("should transfer STX to creator", () => {
            const creatorBalanceBefore = simnet.getAssetsMap().get("STX")?.get(creator) || 0n;
            const userBalanceBefore = simnet.getAssetsMap().get("STX")?.get(user) || 0n;

            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const creatorBalanceAfter = simnet.getAssetsMap().get("STX")?.get(creator) || 0n;
            const userBalanceAfter = simnet.getAssetsMap().get("STX")?.get(user) || 0n;

            expect(creatorBalanceAfter).toBe(creatorBalanceBefore + 1000000n);
            expect(userBalanceAfter).toBeLessThan(userBalanceBefore);
        });
    });

    describe("Access Verification", () => {
        it("should return false for user without access", () => {
            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            expect(result).toStrictEqual(Cl.bool(false));
        });

        it("should return access details after payment", () => {
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "get-user-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            expect(result).toBeSome(
                Cl.tuple({
                    "paid-amount": Cl.uint(1000000),
                    "purchased-at": Cl.uint(simnet.blockHeight),
                    "expires-at": Cl.none(),
                })
            );
        });

        it("should verify access correctly", () => {
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "verify-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            expect(result).toBeOk(Cl.bool(true));
        });
    });

    describe("Payment Receipts", () => {
        it("should create payment receipt", () => {
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "get-payment-receipt",
                [Cl.uint(1)],
                user
            );

            expect(result).toBeSome(
                Cl.tuple({
                    user: Cl.principal(user),
                    "content-id": Cl.uint(1),
                    amount: Cl.uint(1000000),
                    timestamp: Cl.uint(simnet.blockHeight),
                    "tx-sender": Cl.principal(user),
                })
            );
        });

        it("should increment receipt counter", () => {
            // Register another content
            simnet.callPublicFn(
                "content-registry",
                "register-content",
                [
                    Cl.stringAscii("QmAbc987654321zyxwvutsrqponmlkjihgfedcba"),
                    Cl.uint(2000000),
                    Cl.stringUtf8("https://example.com/metadata2.json"),
                ],
                creator
            );

            // Make two payments
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const user2 = accounts.get("wallet_3")!;
            simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(2)],
                user2
            );

            const { result } = simnet.callReadOnlyFn(
                "payment-handler",
                "get-total-receipts",
                [],
                user
            );

            expect(result).toBeOk(Cl.uint(2));
        });
    });

    describe("Multiple Users and Content", () => {
        it("should handle multiple users purchasing same content", () => {
            const user2 = accounts.get("wallet_3")!;

            // User 1 pays
            const { result: result1 } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            // User 2 pays
            const { result: result2 } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user2
            );

            expect(result1).toBeOk(Cl.bool(true));
            expect(result2).toBeOk(Cl.bool(true));

            // Both should have access
            const { result: access1 } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            const { result: access2 } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user2), Cl.uint(1)],
                user2
            );

            expect(access1).toStrictEqual(Cl.bool(true));
            expect(access2).toStrictEqual(Cl.bool(true));
        });

        it("should handle user purchasing multiple content", () => {
            // Register second content
            simnet.callPublicFn(
                "content-registry",
                "register-content",
                [
                    Cl.stringAscii("QmAbc987654321zyxwvutsrqponmlkjihgfedcba"),
                    Cl.uint(2000000),
                    Cl.stringUtf8("https://example.com/metadata2.json"),
                ],
                creator
            );

            // User pays for both
            const { result: result1 } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(1)],
                user
            );

            const { result: result2 } = simnet.callPublicFn(
                "payment-handler",
                "pay-for-content-stx",
                [Cl.uint(2)],
                user
            );

            expect(result1).toBeOk(Cl.bool(true));
            expect(result2).toBeOk(Cl.bool(true));

            // Should have access to both
            const { result: access1 } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(1)],
                user
            );

            const { result: access2 } = simnet.callReadOnlyFn(
                "payment-handler",
                "has-access",
                [Cl.principal(user), Cl.uint(2)],
                user
            );

            expect(access1).toStrictEqual(Cl.bool(true));
            expect(access2).toStrictEqual(Cl.bool(true));
        });
    });
});
