
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  caseNumber: z.string().min(1, "Case number is required"),
  caseTitle: z.string().min(1, "Case title is required"),
  filePages: z.coerce.number().int().min(1, "Page count must be at least 1"),
  courtType: z.enum(["magistrate", "high"]),
  scale: z.string().min(1, "Scale is required"),
  lawyerName: z.string().min(1, "Lawyer name is required"),
  lawyerFirm: z.string().min(1, "Firm name is required"),
  lawyerAddress: z.string().min(1, "Address is required"),
  lawyerEmail: z.string().email("Invalid email address"),
  lawyerPhone: z.string().min(1, "Phone number is required"),
});

interface CaseInformationFormProps {
  onSubmit: (data: any) => void;
  initialData?: {
    clientName?: string;
    caseNumber?: string;
    caseTitle?: string;
    filePages?: number;
    courtType?: string;
    scale?: string;
    lawyer?: {
      name?: string;
      firm?: string;
      address?: string;
      email?: string;
      phone?: string;
    };
  };
}

const CaseInformationForm = ({ onSubmit, initialData = {} }: CaseInformationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: initialData?.clientName || "",
      caseNumber: initialData?.caseNumber || "",
      caseTitle: initialData?.caseTitle || "",
      filePages: initialData?.filePages || 500,
      courtType: (initialData?.courtType as "magistrate" | "high") || "magistrate",
      scale: initialData?.scale || "B",
      lawyerName: initialData?.lawyer?.name || "",
      lawyerFirm: initialData?.lawyer?.firm || "",
      lawyerAddress: initialData?.lawyer?.address || "",
      lawyerEmail: initialData?.lawyer?.email || "",
      lawyerPhone: initialData?.lawyer?.phone || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        clientName: initialData?.clientName || "",
        caseNumber: initialData?.caseNumber || "",
        caseTitle: initialData?.caseTitle || "",
        filePages: initialData?.filePages || 500,
        courtType: (initialData?.courtType as "magistrate" | "high") || "magistrate",
        scale: initialData?.scale || "B",
        lawyerName: initialData?.lawyer?.name || "",
        lawyerFirm: initialData?.lawyer?.firm || "",
        lawyerAddress: initialData?.lawyer?.address || "",
        lawyerEmail: initialData?.lawyer?.email || "",
        lawyerPhone: initialData?.lawyer?.phone || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedData = {
      ...values,
      lawyer: {
        name: values.lawyerName,
        firm: values.lawyerFirm,
        address: values.lawyerAddress,
        email: values.lawyerEmail,
        phone: values.lawyerPhone,
      }
    };
    
    onSubmit(formattedData);
    toast.success("Case information saved");
  };

  const courtType = form.watch("courtType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Case Details</h3>
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123/2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith vs. Jones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="filePages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Pages</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courtType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select court type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="magistrate">Magistrate Court</SelectItem>
                      <SelectItem value="high">High Court</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scale/Column</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courtType === "magistrate" ? (
                        <>
                          <SelectItem value="B">Scale B</SelectItem>
                          <SelectItem value="C">Scale C</SelectItem>
                          <SelectItem value="D">Scale D</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="ATTORNEY">Attorney</SelectItem>
                          <SelectItem value="CANDIDATE">Candidate</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Lawyer Information</h3>
            
            <FormField
              control={form.control}
              name="lawyerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lawyer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lawyer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lawyerFirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter firm name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lawyerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lawyerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lawyerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Continue to Tariff Calculator</Button>
        </div>
      </form>
    </Form>
  );
};

export default CaseInformationForm;
