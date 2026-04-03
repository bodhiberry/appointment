"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Calendar, User, Building, MessageSquare, Phone, Mail,
  Loader2, ArrowRight, Upload, X, FileImage, ChevronDown, Clock
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const visitorSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  citizenshipNo: z.string().min(5, "ID number is required"),
  organization: z.string().min(2, "Organization is required"),
  purpose: z.string().min(2, "Purpose is required"),
  personToMeet: z.string().min(2, "Name of person to meet is required"),
  visitDate: z.string().min(1, "Date is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  visitTime: z.string().min(1, "Visit time is required"),
});

type VisitorFormValues = z.infer<typeof visitorSchema>;

export default function VisitorRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split("T")[0],
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocumentFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setDocumentPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  }

  function removeFile() {
    setDocumentFile(null);
    setDocumentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: VisitorFormValues) {
    setIsSubmitting(true);
    try {
      let documentUrl: string | undefined;

      // Upload document to Cloudinary if provided
      if (documentFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", documentFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) throw new Error("Document upload failed");
        const uploadData = await uploadRes.json();
        documentUrl = uploadData.url;
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, documentUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to submit request");
      }

      const result = await response.json();
      toast.success("Request submitted successfully!");
      router.push(`/request/success/${result.requestId}`);
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(msg);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

  return (
    <div className="container max-w-2xl px-4 py-12 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Visitor Request Form</h1>
        <p className="text-slate-500">Please fill out the form below to request a visitor pass for SM.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white border rounded-2xl shadow-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input {...register("name")} placeholder="John Doe"
                className={cn(inputClass, errors.name && "border-red-500")} />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Citizenship ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Citizenship / ID Number</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input {...register("citizenshipNo")} placeholder="123-456-789"
                className={cn(inputClass, errors.citizenshipNo && "border-red-500")} />
            </div>
            {errors.citizenshipNo && <p className="text-xs text-red-500">{errors.citizenshipNo.message}</p>}
          </div>

          {/* Organization */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Organization</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input {...register("organization")} placeholder="Company / Institution"
                className={cn(inputClass, errors.organization && "border-red-500")} />
            </div>
            {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
          </div>

          {/* Purpose */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Purpose of Visit</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <textarea
                {...register("purpose")}
                placeholder="e.g. Meeting, Document Submission, Delivery"
                rows={3}
                className={cn(
                  "flex w-full rounded-md border border-slate-200 bg-white px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  errors.purpose && "border-red-500"
                )}
              />
            </div>
            {errors.purpose && <p className="text-xs text-red-500">{errors.purpose.message}</p>}
          </div>

          {/* Person to Meet */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Person to Meet</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                {...register("personToMeet")}
                className={cn(inputClass, "appearance-none", errors.personToMeet && "border-red-500")}
              >
                <option value="">Select Person/Team</option>
                <option value="Surnim Wagley">Surnim Wagley</option>
                <option value="Team">Team</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.personToMeet && <p className="text-xs text-red-500">{errors.personToMeet.message}</p>}
          </div>

          {/* Preferred Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="date" {...register("visitDate")}
                className={cn(inputClass, errors.visitDate && "border-red-500")} />
            </div>
            {errors.visitDate && <p className="text-xs text-red-500">{errors.visitDate.message}</p>}
          </div>

          {/* Preferred Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="time" {...register("visitTime")}
                className={cn(inputClass, errors.visitTime && "border-red-500")} />
            </div>
            {errors.visitTime && <p className="text-xs text-red-500">{errors.visitTime.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input {...register("phone")} placeholder="+977 98XXXXXXXX"
                className={cn(inputClass, errors.phone && "border-red-500")} />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input {...register("email")} placeholder="john@example.com"
                className={cn(inputClass, errors.email && "border-red-500")} />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Document Upload */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">
              Citizenship Document <span className="text-slate-400 font-normal">(Optional — photo or scan)</span>
            </label>
            {documentFile ? (
              <div className="flex items-start gap-4 p-4 bg-slate-50 border rounded-xl">
                {documentPreview ? (
                  <img src={documentPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
                ) : (
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{documentFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(documentFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={removeFile}
                  className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Click to upload document</span>
                <span className="text-xs">JPG, PNG, PDF up to 10MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Submit Request <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
