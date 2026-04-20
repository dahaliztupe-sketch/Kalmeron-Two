import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

interface AATLogEntry {
  agent_id: string;
  agent_role: string;
  action: string;
  intent: string;
  tools_called: string[];
  input_data_hash: string;
  output_summary: string;
  trust_level: 'low' | 'medium' | 'high';
  timestamp: Timestamp;
  user_id: string;
  session_id: string;
  gdpr_consent_id?: string;
  risk_assessment?: {
    level: 'low' | 'medium' | 'high';
    justification: string;
  };
  previous_hash: string;
  current_hash: string;
}

export class ImmutableAuditTrail {
  private collection = db.collection('audit_trail');
  
  async logDecision(params: Omit<AATLogEntry, 'previous_hash' | 'current_hash' | 'timestamp'>): Promise<string> {
    const lastLog = await this.collection
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    const previousHash = lastLog.empty 
      ? '0'.repeat(64) 
      : lastLog.docs[0].data()?.current_hash || '0'.repeat(64);
    
    const timestamp = Timestamp.now();
    const dataToHash = {
      ...params,
      previous_hash: previousHash,
      timestamp: timestamp.toMillis(),
    };
    
    const currentHash = createHash('sha256')
      .update(JSON.stringify(dataToHash))
      .digest('hex');
    
    const logEntry: AATLogEntry = {
      ...params,
      timestamp,
      previous_hash: previousHash,
      current_hash: currentHash,
    };
    
    await this.collection.add(logEntry);
    
    return currentHash;
  }
}
