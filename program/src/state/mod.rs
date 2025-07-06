use anchor_lang::prelude::*;

/// Payment channel state account
#[account]
pub struct PaymentChannel {
    /// Party A's public key (channel opener)
    pub party_a: Pubkey,
    
    /// Party B's public key (channel participant)
    pub party_b: Pubkey,
    
    /// Party A's current balance in the channel
    pub balance_a: u64,
    
    /// Party B's current balance in the channel
    pub balance_b: u64,
    
    /// Current nonce to prevent replay attacks
    pub nonce: u64,
    
    /// Whether the channel is currently open
    pub is_open: bool,
    
    /// Timestamp when the channel was opened
    pub opened_at: i64,
    
    /// Timestamp when the channel can be force-closed (timeout)
    pub timeout_at: i64,
    
    /// PDA bump seed
    pub bump: u8,
}

impl PaymentChannel {
    /// Calculate the space needed for the account
    pub const LEN: usize = 8 + // discriminator
        32 + // party_a
        32 + // party_b
        8 +  // balance_a
        8 +  // balance_b
        8 +  // nonce
        1 +  // is_open
        8 +  // opened_at
        8 +  // timeout_at
        1;   // bump

    /// Check if the channel is open
    pub fn is_open(&self) -> bool {
        self.is_open
    }

    /// Check if the channel has timed out
    pub fn has_timed_out(&self, current_timestamp: i64) -> bool {
        current_timestamp >= self.timeout_at
    }

    /// Get the total channel balance
    pub fn total_balance(&self) -> u64 {
        self.balance_a + self.balance_b
    }

    /// Check if a party is a participant in this channel
    pub fn is_participant(&self, party: &Pubkey) -> bool {
        party == &self.party_a || party == &self.party_b
    }

    /// Get the other party's public key
    pub fn get_other_party(&self, party: &Pubkey) -> Option<Pubkey> {
        if party == &self.party_a {
            Some(self.party_b)
        } else if party == &self.party_b {
            Some(self.party_a)
        } else {
            None
        }
    }
} 