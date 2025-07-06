use anchor_lang::prelude::*;
use crate::state::PaymentChannel;
use crate::errors::SolBoltError;
use crate::ForceCloseChannel;



pub fn handler(ctx: Context<ForceCloseChannel>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    let clock = Clock::get()?;
    
    // Check if channel has timed out
    require!(
        channel.has_timed_out(clock.unix_timestamp),
        SolBoltError::ChannelNotTimedOut
    );
    
    // Close the channel with current balances
    channel.is_open = false;
    
    msg!("Payment channel force-closed by {}", ctx.accounts.authority.key());
    msg!("Final balances - Party A: {}, Party B: {}", 
         channel.balance_a, channel.balance_b);
    msg!("Channel was open for {} seconds", 
         clock.unix_timestamp - channel.opened_at);
    
    Ok(())
} 