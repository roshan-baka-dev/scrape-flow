"use server";

import { prisma } from "@/lib/prisma";
import {createWorkflowSchema, createWorkflowSchemaType} from "@/schema/workflows"
import { workflowStatus } from "@/types/workflows";
import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/dist/server/api-utils";
import {z} from "zod"
import  {redirect}  from "next/navigation";
import { AppNode } from "@/types/appNode";
import { Edge } from "@xyflow/react";
import { TaskType } from "@/types/task";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";

export async function CreateWorkflow (
    form:createWorkflowSchemaType
){
    const {success,data}=createWorkflowSchema.safeParse(form);
    if(!success){
        throw new Error("Invalid form data!");
    }
    
    const {userId} = auth();

    if(!userId){
        throw new Error("unauthorised!!");
    }

    const initialFlow:{
        nodes:AppNode[];
        edges:Edge[];
    }={
        nodes:[],
        edges:[]
    }

    // lets add the flow entry point
    initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

    const result=await prisma.workflow.create({
        data : {
            userId,
            status:workflowStatus.DRAFT,
            definition:JSON.stringify(initialFlow),
            ...data,
        },
    })
    if(!result){
        throw new Error("failed to create workflow!!");
    }

    redirect(`/workflow/editor/${result.id}`)
}