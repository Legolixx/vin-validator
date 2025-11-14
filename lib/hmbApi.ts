import { prisma } from "@/lib/prisma";

export async function getValidToken(): Promise<string> {
  const existingToken = await prisma.api_token.findFirst({
    where: {
      xata_createdat: { gt: new Date() },
    },
  });


  if (existingToken) return existingToken.token as string;

  const client_id = process.env.HMB_CLIENT_ID!;
  const client_secret = process.env.HMB_CLIENT_SECRET!;

  const tokenResponse = await fetch("https://api.hyundai-brasil.com:8065/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id,
      client_secret,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Erro ao obter token:", errorText);
    throw new Error("Erro ao obter token");
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  await prisma.api_token.create({
    data: {
      token: accessToken,
      xata_updatedat: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
    },
  });

  return accessToken;
}
