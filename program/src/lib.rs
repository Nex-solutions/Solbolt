use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Define account structs directly in lib.rs for Anchor macro
#[derive(Accounts)]
pub struct OpenChannel<'info> {
    #[account(
        init,
        payer = party_a,
        space = 8 + crate::state::PaymentChannel::LEN,
        seeds = [
            b"channel",
            party_a.key().as_ref(),
            party_b.key().as_ref()
        ],
        bump
    )]
    pub channel: Account<'info, crate::state::PaymentChannel>,
    
    #[account(mut)]
    pub party_a: Signer<'info>,
    
    /// CHECK: Party B doesn't need to sign channel creation
    pub party_b: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateChannel<'info> {
    #[account(
        mut,
        seeds = [
            b"channel",
            channel.party_a.as_ref(),
            channel.party_b.as_ref()
        ],
        bump = channel.bump,
        constraint = channel.is_open @ crate::errors::SolBoltError::ChannelNotOpen
    )]
    pub channel: Account<'info, crate::state::PaymentChannel>,
    
    /// CHECK: Any party can update the channel with valid signatures
    pub authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseChannel<'info> {
    #[account(
        mut,
        seeds = [
            b"channel",
            channel.party_a.as_ref(),
            channel.party_b.as_ref()
        ],
        bump = channel.bump,
        constraint = channel.is_open @ crate::errors::SolBoltError::ChannelNotOpen,
        close = party_a
    )]
    pub channel: Account<'info, crate::state::PaymentChannel>,
    
    #[account(mut)]
    pub party_a: Signer<'info>,
    
    /// CHECK: Party B doesn't need to sign for cooperative close
    #[account(mut)]
    pub party_b: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ForceCloseChannel<'info> {
    #[account(
        mut,
        seeds = [
            b"channel",
            channel.party_a.as_ref(),
            channel.party_b.as_ref()
        ],
        bump = channel.bump,
        constraint = channel.is_open @ crate::errors::SolBoltError::ChannelNotOpen,
        close = authority
    )]
    pub channel: Account<'info, crate::state::PaymentChannel>,
    
    #[account(
        mut,
        constraint = channel.is_participant(&authority.key()) @ crate::errors::SolBoltError::NotParticipant
    )]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[program]
pub mod solbolt {
    use super::*;

    /// Opens a new payment channel between two parties
    pub fn open_channel(
        ctx: Context<OpenChannel>,
        initial_deposit: u64,
    ) -> Result<()> {
        instructions::open_channel::handler(ctx, initial_deposit)
    }

    /// Updates the channel state with new balances and nonce
    pub fn update_channel(
        ctx: Context<UpdateChannel>,
        balance_a: u64,
        balance_b: u64,
        nonce: u64,
        signature_a: Vec<u8>,
        signature_b: Vec<u8>,
    ) -> Result<()> {
        instructions::update_channel::handler(
            ctx,
            balance_a,
            balance_b,
            nonce,
            signature_a,
            signature_b,
        )
    }

    /// Closes the payment channel and settles final balances
    pub fn close_channel(
        ctx: Context<CloseChannel>,
        balance_a: u64,
        balance_b: u64,
        nonce: u64,
        signature_a: Vec<u8>,
        signature_b: Vec<u8>,
    ) -> Result<()> {
        instructions::close_channel::handler(
            ctx,
            balance_a,
            balance_b,
            nonce,
            signature_a,
            signature_b,
        )
    }

    /// Allows a party to close the channel unilaterally after timeout
    pub fn force_close_channel(
        ctx: Context<ForceCloseChannel>,
    ) -> Result<()> {
        instructions::force_close_channel::handler(ctx)
    }
} 