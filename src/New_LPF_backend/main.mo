import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Time "mo:base/Time";
import List "mo:base/List";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor {
    // Types
    type Message = {
        from: Principal;
        encryptedContent: Blob;    // Encrypted message content
        publicKey: Blob;           // Sender's public key
        timestamp: Int;
        expiresAt: Int;           // TTL timestamp
    };

    type UserKeys = {
        publicKey: Blob;
        lastUpdated: Int;
    };

    // State
    private stable var chatHistory = Trie.empty<Principal, List.List<Message>>();
    private stable var userKeys = Trie.empty<Principal, UserKeys>();
    private let MESSAGE_TTL_NANOS : Int = 24 * 60 * 60 * 1000000000; // 24 hours in nanoseconds

    // Helper functions
    private func key(x : Principal) : Trie.Key<Principal> {
        { key = x; hash = Principal.hash(x) }
    };

    // Set or update user's public key
    public shared(msg) func setPublicKey(publicKey: Blob) : async () {
        let userKey : UserKeys = {
            publicKey = publicKey;
            lastUpdated = Time.now();
        };
        userKeys := Trie.put(userKeys, key(msg.caller), Principal.equal, userKey).0;
    };

    // Get a user's public key
    public query func getPublicKey(user: Principal) : async ?Blob {
        switch (Trie.get(userKeys, key(user), Principal.equal)) {
            case null null;
            case (?userKey) ?userKey.publicKey;
        };
    };

    // Send an encrypted message to another user
    public shared(msg) func sendEncryptedMessage(to: Principal, encryptedContent: Blob, publicKey: Blob) : async () {
        let currentTime = Time.now();
        let message : Message = {
            from = msg.caller;
            encryptedContent = encryptedContent;
            publicKey = publicKey;
            timestamp = currentTime;
            expiresAt = currentTime + MESSAGE_TTL_NANOS;
        };

        // Add message to sender's history
        let senderMessages = switch (Trie.get(chatHistory, key(msg.caller), Principal.equal)) {
            case null List.nil<Message>();
            case (?exists) exists;
        };
        let updatedSenderMessages = List.push<Message>(message, senderMessages);
        chatHistory := Trie.put(chatHistory, key(msg.caller), Principal.equal, updatedSenderMessages).0;

        // Add message to receiver's history
        let receiverMessages = switch (Trie.get(chatHistory, key(to), Principal.equal)) {
            case null List.nil<Message>();
            case (?exists) exists;
        };
        let updatedReceiverMessages = List.push<Message>(message, receiverMessages);
        chatHistory := Trie.put(chatHistory, key(to), Principal.equal, updatedReceiverMessages).0;
    };

    // Get messages for the calling user
    public shared query(msg) func getMessages() : async [Message] {
        let userMessages = switch (Trie.get(chatHistory, key(msg.caller), Principal.equal)) {
            case null List.nil<Message>();
            case (?exists) List.filter<Message>(
                exists,
                func(msg : Message) : Bool {
                    msg.expiresAt > Time.now()
                }
            );
        };
        
        List.toArray(userMessages)
    };

    // Get message count for the calling user
    public shared query(msg) func getMessageCount() : async Nat {
        let currentTime = Time.now();
        let userMessages = switch (Trie.get(chatHistory, key(msg.caller), Principal.equal)) {
            case null List.nil<Message>();
            case (?exists) List.filter<Message>(
                exists,
                func(msg : Message) : Bool {
                    msg.expiresAt > currentTime
                }
            );
        };
        
        List.size(userMessages)
    };

    // Clear all messages for the calling user
    public shared(msg) func clearMessages() : async () {
        chatHistory := Trie.put(chatHistory, key(msg.caller), Principal.equal, List.nil<Message>()).0;
    };

    // Get all users with public keys
    public query func getAllUsers() : async [Principal] {
        let entries = Trie.iter(userKeys);
        let users = Buffer.Buffer<Principal>(0);
        for ((principal, _) in entries) {
            users.add(principal);
        };
        Buffer.toArray(users)
    };

    // Health check
    public query func health() : async Text {
        "OK"
    };
};
