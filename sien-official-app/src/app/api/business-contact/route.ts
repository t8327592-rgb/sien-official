import { validateConsent, enumField, INQUIRY_TYPES } from "@/lib/order-validation";
import { submissionIdentity, existingSubmission, acceptSubmission, submissionResponse } from "@/lib/submission";
import { processPendingNotifications } from "@/lib/notifications";
import { readJson, textField, emailField, apiErrorResponse } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { after, NextResponse } from "next/server";

import { requestIdentity } from "@/lib/request-identity";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const identity = submissionIdentity(body, "BUSINESS");
    const existing = await existingSubmission(identity);
    if (existing) return NextResponse.json(submissionResponse(existing));
    const consent = validateConsent(body);
    const companyName = textField(body, "companyName", true, 120);
    const contactName = textField(body, "contactName", true, 120);
    const email = emailField(body, "email");
    const inquiryType = enumField(body, "inquiryType", INQUIRY_TYPES);
    const budget = textField(body, "budget", false, 120);
    const deadline = textField(body, "deadline", false, 120);
    const message = textField(body, "message", true, 5000);
    await consumeRateLimit("business-client", 10, 3600, requestIdentity(request.headers, email));
    await consumeRateLimit("business-email", 5, 3600, email);
    await consumeRateLimit("business-emergency", 10000, 3600);

    // DBへの保存
    const receipt = await acceptSubmission(identity, { inquiryType, budget, deadline }, async tx => {
      const record = await tx.businessContact.create({
      data: {
        companyName,
        contactName,
        email,
        inquiryType,
        budget,
        deadline,
        message,
        status: "PENDING",
      },
      });
      return record;
    }, consent);
    after(async () => { await processPendingNotifications(3); });

    return NextResponse.json(submissionResponse(receipt), { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Business contact creation failed");
    return NextResponse.json({ success: false, error: "Failed to create business contact" }, { status: 500 });
  }
}

export const maxDuration = 60;
