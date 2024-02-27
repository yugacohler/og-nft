import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { createPublicClient, createWalletClient, http } from 'viem';
import YugaOGNFT from '../../../constants/YugaOGNFT.json';

require('dotenv').config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const PROVIDER_URL = process.env.PROVIDER_URL;

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let text: string | undefined = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  if (!accountAddress) {
    return getErrorResponse('No account address found');
  }

  // if (!message?.following) {
  //   return new NextResponse(
  //     getFrameHtmlResponse({
  //       buttons: [
  //         {
  //           label: 'Please follow yuga.eth first!',
  //         },
  //       ],
  //       image: `${NEXT_PUBLIC_URL}/like.webp`,
  //     }),
  //   );
  // }

  const nftOwnerAccount = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);
  const nftOwnerClient = createWalletClient({
    account: nftOwnerAccount,
    chain: baseSepolia,
    transport: http(PROVIDER_URL as string),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(PROVIDER_URL as string),
  });

  let minted = false;
  let error = null;

  // TODO: Change limit to 25K
  // TODO: Rotate private key

  try {
    minted = !!(await publicClient.readContract({
      address: process.env.NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: YugaOGNFT.abi,
      functionName: 'minted',
      args: [accountAddress],
    }));
  } catch (err) {
    console.error(err);
    return getErrorResponse((err as Error).message);
  }

  if (minted) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: 'Thank you for minting!',
          },
        ],
        image: `${NEXT_PUBLIC_URL}/thanks.webp`,
        postUrl: `${NEXT_PUBLIC_URL}/api/minted`,
      }),
    );
  } else {
    // Try to mint and airdrop the NFT
    try {
      const { request } = await publicClient.simulateContract({
        account: nftOwnerAccount,
        address: process.env.NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: YugaOGNFT.abi,
        functionName: 'mintFor',
        args: [accountAddress],
      });
      await nftOwnerClient.writeContract(request);
    } catch (err) {
      console.error(err);
      return getErrorResponse((err as Error).message);
    }

    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: 'Thank you for minting!',
          },
        ],
        image: `${NEXT_PUBLIC_URL}/thanks.webp`,
        postUrl: `${NEXT_PUBLIC_URL}/api/minted`,
      }),
    );
  }
}

function getErrorResponse(label: string): NextResponse {
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Error: ' + label,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/intro.webp`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
