import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Mint',
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/intro.webp`,
    aspectRatio: '1:1',
  },
  input: {
    text: 'Mint your yuga.eth NFT!',
  },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'yuga.eth NFT',
  description: 'yuga.eth NFT',
  openGraph: {
    title: 'yuga.eth NFT',
    description: 'yuga.eth NFT',
    images: [`${NEXT_PUBLIC_URL}/intro.webp`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>yuga.eth NFT!</h1>
    </>
  );
}
