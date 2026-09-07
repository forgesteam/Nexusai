import type { Conversation, KnowledgeItem, Settings } from '../types';

export const defaultSettings: Settings = {
  businessName: 'Northstar Goods',
  ownerEmail: 'owner@northstargoods.co',
  welcomeMessage: 'Hi! I can help with products, pricing, and store hours. What can I find for you?',
  telegramEnabled: false,
  whatsappEnabled: false,
};

export const starterKnowledge: KnowledgeItem[] = [
  {
    id: 'kb-camp-mug',
    question: 'What is the price of the enamel camp mug?',
    answer: 'Our 12 oz enamel camp mug is $24. It is dishwasher-safe and includes a 30-day return window.',
    category: 'Pricing',
    updatedAt: 1787331600000,
  },
  {
    id: 'kb-shipping',
    question: 'How quickly do you ship orders?',
    answer: 'Orders placed before 2 PM Pacific time ship within one business day. Standard delivery usually arrives in 3–5 business days in the continental United States.',
    category: 'Policies',
    updatedAt: 1787245200000,
  },
  {
    id: 'kb-hours',
    question: 'What are your store hours?',
    answer: 'Our Portland showroom is open Tuesday through Saturday, 10 AM–6 PM Pacific time. We are closed Sunday and Monday.',
    category: 'Hours',
    updatedAt: 1787158800000,
  },
  {
    id: 'kb-blanket',
    question: 'Tell me about the wool trail blanket.',
    answer: 'The wool trail blanket is a 54 by 72 inch, 80% recycled wool blend designed for picnics, cabin weekends, and cool nights outdoors. It is $96.',
    category: 'Products',
    updatedAt: 1787072400000,
  },
];

export const starterConversations: Conversation[] = [
  {
    id: 'demo-conv-1',
    visitorName: 'Maya Chen',
    visitorEmail: 'maya.chen@cedarworks.io',
    source: 'Website',
    status: 'Resolved',
    createdAt: 1787396400000,
    updatedAt: 1787396460000,
    messages: [
      { id: 'm1', role: 'visitor', text: 'How much is the enamel camp mug?', createdAt: 1787396400000 },
      { id: 'm2', role: 'assistant', text: 'Our 12 oz enamel camp mug is $24. It is dishwasher-safe and includes a 30-day return window.', createdAt: 1787396460000 },
    ],
  },
  {
    id: 'demo-conv-2',
    visitorName: 'Elliot Rivera',
    visitorEmail: 'elliot@rivera.studio',
    source: 'Website',
    status: 'Needs follow-up',
    createdAt: 1787306400000,
    updatedAt: 1787306580000,
    messages: [
      { id: 'm3', role: 'visitor', text: 'Can you make the trail blanket with our company colors?', createdAt: 1787306400000 },
      { id: 'm4', role: 'assistant', text: 'I do not have a confident answer for that yet. I have asked the Northstar Goods team to follow up.', createdAt: 1787306580000 },
    ],
  },
];

declare global {
  interface Window {
    genmb: {
      kv: {
        get: (key: string) => Promise<unknown | null>;
        set: (key: string, value: unknown) => Promise<void>;
        delete: (key: string) => Promise<{ deleted: boolean }>;
        list: (prefix: string) => Promise<{ data: Array<{ key: string; value: unknown }>; total: number }>;
        increment: (key: string, by?: number) => Promise<number>;
      };
      email: {
        send: (payload: { to: string; subject: string; html?: string; text?: string; replyTo?: string }) => Promise<{ sent: boolean; id?: string }>;
      };
    };
  }
}

export async function getSettings() {
  const stored = await window.genmb.kv.get('replyharbor:settings');
  return stored ? { ...defaultSettings, ...(stored as Settings) } : defaultSettings;
}

export async function getKnowledge() {
  const result = await window.genmb.kv.list('replyharbor:knowledge:');
  const records = result.data.map((record) => record.value as KnowledgeItem);
  return records.length > 0 ? records.sort((a, b) => b.updatedAt - a.updatedAt) : starterKnowledge;
}

export async function getConversations() {
  const result = await window.genmb.kv.list('replyharbor:conversation:');
  const records = result.data.map((record) => record.value as Conversation);
  return records.length > 0 ? records.sort((a, b) => b.updatedAt - a.updatedAt) : starterConversations;
}
