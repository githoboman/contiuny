import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const user = accounts.get("wallet_2")!;

describe("Content Registry Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("2.5");
  });

  describe("Content Registration", () => {
    it("should register new content successfully", () => {
      const ipfsHash = "QmXyz123456789abcdefghijklmnopqrstuvwxyz";
      const price = 1000000; // 1 STX
      const metadataUri = "https://example.com/metadata.json";

      const { result } = simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii(ipfsHash),
          Cl.uint(price),
          Cl.stringUtf8(metadataUri),
        ],
        creator
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should fail with invalid price (zero)", () => {
      const ipfsHash = "QmXyz123456789abcdefghijklmnopqrstuvwxyz";
      const price = 0;
      const metadataUri = "https://example.com/metadata.json";

      const { result } = simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii(ipfsHash),
          Cl.uint(price),
          Cl.stringUtf8(metadataUri),
        ],
        creator
      );

      expect(result).toBeErr(Cl.uint(104)); // err-invalid-price
    });

    it("should increment content ID for multiple registrations", () => {
      const ipfsHash1 = "QmXyz123456789abcdefghijklmnopqrstuvwxyz";
      const ipfsHash2 = "QmAbc987654321zyxwvutsrqponmlkjihgfedcba";
      const price = 1000000;
      const metadataUri = "https://example.com/metadata.json";

      const { result: result1 } = simnet.callPublicFn(
        "content-registry",
        "register-content",
        [Cl.stringAscii(ipfsHash1), Cl.uint(price), Cl.stringUtf8(metadataUri)],
        creator
      );

      const { result: result2 } = simnet.callPublicFn(
        "content-registry",
        "register-content",
        [Cl.stringAscii(ipfsHash2), Cl.uint(price), Cl.stringUtf8(metadataUri)],
        creator
      );

      expect(result1).toBeOk(Cl.uint(1));
      expect(result2).toBeOk(Cl.uint(2));
    });
  });

  describe("Content Information Retrieval", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
          Cl.uint(1000000),
          Cl.stringUtf8("https://example.com/metadata.json"),
        ],
        creator
      );
    });

    it("should retrieve content info", () => {
      const { result } = simnet.callReadOnlyFn(
        "content-registry",
        "get-content-info",
        [Cl.uint(1)],
        creator
      );

      expect(result).toBeSome(
        Cl.tuple({
          creator: Cl.principal(creator),
          "ipfs-hash": Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
          "price-stx": Cl.uint(1000000),
          "price-token": Cl.none(),
          "token-contract": Cl.none(),
          "metadata-uri": Cl.stringUtf8("https://example.com/metadata.json"),
          "created-at": Cl.uint(simnet.blockHeight),
          "is-active": Cl.bool(true),
        })
      );
    });

    it("should return none for non-existent content", () => {
      const { result } = simnet.callReadOnlyFn(
        "content-registry",
        "get-content-info",
        [Cl.uint(999)],
        creator
      );

      expect(result).toBeNone();
    });

    it("should get content price", () => {
      const { result } = simnet.callReadOnlyFn(
        "content-registry",
        "get-content-price",
        [Cl.uint(1)],
        creator
      );

      expect(result).toBeOk(Cl.uint(1000000));
    });
  });

  describe("Price Updates", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
          Cl.uint(1000000),
          Cl.stringUtf8("https://example.com/metadata.json"),
        ],
        creator
      );
    });

    it("should allow creator to update price", () => {
      const newPrice = 2000000;

      const { result } = simnet.callPublicFn(
        "content-registry",
        "update-price",
        [Cl.uint(1), Cl.uint(newPrice)],
        creator
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify price was updated
      const { result: priceResult } = simnet.callReadOnlyFn(
        "content-registry",
        "get-content-price",
        [Cl.uint(1)],
        creator
      );

      expect(priceResult).toBeOk(Cl.uint(newPrice));
    });

    it("should prevent non-creator from updating price", () => {
      const { result } = simnet.callPublicFn(
        "content-registry",
        "update-price",
        [Cl.uint(1), Cl.uint(2000000)],
        user
      );

      expect(result).toBeErr(Cl.uint(103)); // err-unauthorized
    });

    it("should fail with zero price", () => {
      const { result } = simnet.callPublicFn(
        "content-registry",
        "update-price",
        [Cl.uint(1), Cl.uint(0)],
        creator
      );

      expect(result).toBeErr(Cl.uint(105)); // err-price-too-low
    });
  });

  describe("Content Activation/Deactivation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
          Cl.uint(1000000),
          Cl.stringUtf8("https://example.com/metadata.json"),
        ],
        creator
      );
    });

    it("should allow creator to deactivate content", () => {
      const { result } = simnet.callPublicFn(
        "content-registry",
        "deactivate-content",
        [Cl.uint(1)],
        creator
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify content is inactive
      const { result: activeResult } = simnet.callReadOnlyFn(
        "content-registry",
        "is-content-active",
        [Cl.uint(1)],
        creator
      );

      expect(activeResult).toBeOk(Cl.bool(false));
    });

    it("should allow creator to reactivate content", () => {
      // First deactivate
      simnet.callPublicFn(
        "content-registry",
        "deactivate-content",
        [Cl.uint(1)],
        creator
      );

      // Then reactivate
      const { result } = simnet.callPublicFn(
        "content-registry",
        "reactivate-content",
        [Cl.uint(1)],
        creator
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify content is active
      const { result: activeResult } = simnet.callReadOnlyFn(
        "content-registry",
        "is-content-active",
        [Cl.uint(1)],
        creator
      );

      expect(activeResult).toBeOk(Cl.bool(true));
    });

    it("should prevent non-creator from deactivating", () => {
      const { result } = simnet.callPublicFn(
        "content-registry",
        "deactivate-content",
        [Cl.uint(1)],
        user
      );

      expect(result).toBeErr(Cl.uint(103)); // err-unauthorized
    });
  });

  describe("Creator Content Tracking", () => {
    it("should track creator content count", () => {
      const ipfsHash1 = "QmXyz123456789abcdefghijklmnopqrstuvwxyz";
      const ipfsHash2 = "QmAbc987654321zyxwvutsrqponmlkjihgfedcba";
      const price = 1000000;
      const metadataUri = "https://example.com/metadata.json";

      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [Cl.stringAscii(ipfsHash1), Cl.uint(price), Cl.stringUtf8(metadataUri)],
        creator
      );

      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [Cl.stringAscii(ipfsHash2), Cl.uint(price), Cl.stringUtf8(metadataUri)],
        creator
      );

      const { result } = simnet.callReadOnlyFn(
        "content-registry",
        "get-creator-content-count",
        [Cl.principal(creator)],
        creator
      );

      expect(result).toStrictEqual(Cl.uint(2));
    });

    it("should retrieve creator content by index", () => {
      simnet.callPublicFn(
        "content-registry",
        "register-content",
        [
          Cl.stringAscii("QmXyz123456789abcdefghijklmnopqrstuvwxyz"),
          Cl.uint(1000000),
          Cl.stringUtf8("https://example.com/metadata.json"),
        ],
        creator
      );

      const { result } = simnet.callReadOnlyFn(
        "content-registry",
        "get-creator-content",
        [Cl.principal(creator), Cl.uint(0)],
        creator
      );

      expect(result).toBeSome(
        Cl.tuple({
          "content-id": Cl.uint(1),
        })
      );
    });
  });
});
