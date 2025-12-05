export type Status = 'APPLIED'|'INTERVIEW'|'REJECTED'|'OFFER'
export interface JobApp { id:number; company:string; position:string; status:Status; appliedDate:string; nextActionDate?:string; notes?:string; jobLink?:string; resumeUrl?: string; coverLetterUrl?: string }
export interface Reminder { id:number; application:{id:number}; remindAt:string; message:string; sent:boolean }
export interface CreateReminderReq { applicationId:number; remindAt:string; message:string }
