import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  const reports: Record<string, any> = {
    envMongodbUriExists: !!process.env.MONGODB_URI,
    envJwtSecretExists: !!process.env.JWT_SECRET,
    mongodbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    mongooseConnectionState: mongoose.connection.readyState,
  };

  if (!process.env.MONGODB_URI) {
    reports.status = 'ERROR';
    reports.error = 'MONGODB_URI is missing in your Netlify Environment Variables.';
    return NextResponse.json(reports);
  }

  try {
    // Try connecting with a timeout of 4 seconds so it doesn't hang the Netlify response
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    reports.status = 'SUCCESS';
    reports.message = 'Successfully connected to MongoDB Atlas!';
    reports.connectionStateAfter = conn.connection.readyState;
  } catch (err: any) {
    reports.status = 'FAILED';
    reports.error = err.message || String(err);
    reports.advice = 'If this is a timeout or network error, please ensure your MongoDB Atlas IP Whitelist has 0.0.0.0/0 (Allow access from anywhere) enabled so Netlify serverless servers can connect to it.';
  }

  return NextResponse.json(reports);
}
