import type { NextPage } from "next";
import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import React, { useState, useEffect } from "react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  useAnchorWallet,
  AnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";

import Head from "next/head";

import idl_type from "/Users/loser/projects/mlh/counter/target/idl/counter.json";
import { ConfirmOptions } from "@solana/web3.js";

const Home: NextPage = () => {
  const opts = {
    preflightCommitment: "processed" as ConfirmOptions,
  };
  const connection = useConnection();
  const wallet: AnchorWallet | any = useAnchorWallet();
  const [programState, setProgramState] = useState({} as any);

  const updateCounter = async () => {
    const tx = await programState.program.methods
      .updateCounter()
      .accounts({
        counter: programState.counter,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  };

  const setupCounterProgram = async () => {
    let idl = idl_type as anchor.Idl;

    const network = "https://api.devnet.solana.com ";
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      opts.preflightCommitment
    );

    const program = new Program(
      idl,
      "5iyjRD5AXSeu3EKGcqoE6RHGZk44EkJYw8bacwACmzEL",
      provider
    );

    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBytes()],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter: any = await program.account.counter.fetch(counterPubkey);
    console.log("Your counter", counter);

    setProgramState({
      program: program,
      counter: counterPubkey,
      count: counter.count.toString(),
    });
  };

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      await setupCounterProgram();
    })();
  }, [wallet]);

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      // @ts-ignore
      if (!programState._programId) {
        return;
      }
      console.log("program is setup");
    })();
  }, [programState]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>MLH Counter App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="px-10">
        <div className="mockup-window border bg-base-300">
          <div className="flex justify-center px-4 py-16 bg-base-200">
            <WalletMultiButton />
            <WalletDisconnectButton />
          </div>
          <div className="flex justify-center px-4 py-16 bg-base-200">
            {programState.counter && (
              <div>
                <p>Count: {programState.count}</p>
                <button
                  onClick={async () => {
                    await updateCounter();
                    await setupCounterProgram();
                  }}
                >
                  Update Count
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
