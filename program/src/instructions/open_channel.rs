use anchor_lang::prelude::*;
use crate::state::PaymentChannel;
use crate::errors::SolBoltError;
use crate::OpenChannel;

pub fn handler(
    ctx: Context<OpenChannel>,
    initial_deposit: u64,
) -> Result<()> {
    // Validate deposit amount
    require!(
        initial_deposit > 0,
        SolBoltError::InvalidDepositAmount
    );

    // Validate party order (party_a should be lexicographically smaller)
    require!(
        ctx.accounts.party_a.key() < ctx.accounts.party_b.key(),
        SolBoltError::InvalidPartyOrder
    );

    let clock = Clock::get()?;
    
    // Initialize the payment channel
    let channel = &mut ctx.accounts.channel;
    channel.party_a = ctx.accounts.party_a.key();
    channel.party_b = ctx.accounts.party_b.key();
    channel.balance_a = initial_deposit;
    channel.balance_b = 0;
    channel.nonce = 0;
    channel.is_open = true;
    channel.opened_at = clock.unix_timestamp;
    channel.timeout_at = clock.unix_timestamp + 24 * 60 * 60; // 24 hours timeout
    channel.bump = ctx.bumps.channel;

    msg!("Payment channel opened between {} and {}", 
         channel.party_a, channel.party_b);
    msg!("Initial deposit: {} lamports", initial_deposit);
    msg!("Channel timeout: {} (24 hours from now)", channel.timeout_at);

    Ok(())
} 