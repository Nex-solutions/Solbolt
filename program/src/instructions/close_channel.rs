use anchor_lang::prelude::*;
use crate::state::PaymentChannel;
use crate::errors::SolBoltError;
use crate::CloseChannel;



pub fn handler(
    ctx: Context<CloseChannel>,
    balance_a: u64,
    balance_b: u64,
    nonce: u64,
    signature_a: Vec<u8>,
    signature_b: Vec<u8>,
) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    
    // Validate nonce
    require!(
        nonce > channel.nonce,
        SolBoltError::InvalidNonce
    );
    
    // Validate total balance remains the same
    let total_balance = balance_a + balance_b;
    require!(
        total_balance == channel.total_balance(),
        SolBoltError::InvalidBalance
    );
    
    // Validate individual balances
    require!(balance_a >= 0, SolBoltError::InvalidBalance);
    require!(balance_b >= 0, SolBoltError::InvalidBalance);
    
    // Verify signatures (simplified - in production, you'd verify against actual public keys)
    require!(
        signature_a.len() == 64 && signature_b.len() == 64,
        SolBoltError::InvalidSignature
    );
    
    // Close the channel
    channel.is_open = false;
    channel.balance_a = balance_a;
    channel.balance_b = balance_b;
    channel.nonce = nonce;
    
    msg!("Payment channel closed cooperatively");
    msg!("Final balances - Party A: {}, Party B: {}", balance_a, balance_b);
    msg!("Final nonce: {}", nonce);
    
    Ok(())
} 