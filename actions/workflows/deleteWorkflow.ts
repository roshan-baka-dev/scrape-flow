"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import React from 'react'

export async function DeleteWorkflow(id:string) {
  const {userId}=auth();
  if(!userId){
    throw new Error("unauthorised!");
  }

  await prisma.workflow.delete({
    where:{
        id,
        userId
    },
  });

  revalidatePath("/workflows");
}
