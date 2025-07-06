use anchor_lang::prelude::*;

#[error_code]
pub enum SolBoltError {
    #[msg("Channel is not open")]
    ChannelNotOpen,
    
    #[msg("Channel is already closed")]
    ChannelAlreadyClosed,
    
    #[msg("Invalid nonce - must be greater than current nonce")]
    InvalidNonce,
    
    #[msg("Invalid signature")]
    InvalidSignature,
    
    #[msg("Party is not a participant in this channel")]
    NotParticipant,
    
    #[msg("Channel has not timed out yet")]
    ChannelNotTimedOut,
    
    #[msg("Invalid balance - total must equal initial deposit")]
    InvalidBalance,
    
    #[msg("Insufficient balance for operation")]
    InsufficientBalance,
    
    #[msg("Channel timeout period has not elapsed")]
    TimeoutNotElapsed,
    
    #[msg("Invalid channel state")]
    InvalidChannelState,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Invalid party order")]
    InvalidPartyOrder,
    
    #[msg("Channel already exists")]
    ChannelAlreadyExists,
    
    #[msg("Invalid deposit amount")]
    InvalidDepositAmount,
} 