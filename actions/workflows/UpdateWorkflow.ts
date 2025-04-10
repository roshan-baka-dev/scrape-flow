"use server";

import { waitFor } from "@/lib/helper/waitFor";
import { prisma } from "@/lib/prisma";
import { workflowStatus } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflow({
    id,definition
}:{
    id:string;
    definition:string;
}) {
    // await waitFor(3000);
    const {userId} =auth();
    if(!userId){
        throw new Error("unautherised");
    }

    const workflow=await prisma.workflow.findUnique({
        where:{
            id,userId,
        },
    });

    if(!workflow){
        throw new Error("workflow not found")
    }
    if(workflow.status!==workflowStatus.DRAFT){
        throw new Error("workflow is not a draft");
    }
     
    await prisma.workflow.update({
        data:{
            definition,
        },
        where:{
            id,
            userId
        }
    })

    revalidatePath("/workflows")
}