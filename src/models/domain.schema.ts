import mongo from 'mongoose';

const recordSchema = new mongo.Schema({
  record_id: { type: String, required: true },
  record_name: { type: String, required: true },
  record_value: { type: String, required: true },
  record_type: {
    type: String,
    required: true,
    enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'],
  },
  created_at: { type: Date, default: Date.now },
  priority: { type: Number },
});

const domainSchema = new mongo.Schema({
  subdomain_name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  owner_gmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  create_date: { type: Date, default: Date.now },
  expire_date: { type: Date, required: true },
  records: { type: [recordSchema], required: true },
});

domainSchema.index({ subdomain_name: 1 });
domainSchema.index({ owner_gmail: 1 });

export default mongo.model('domain', domainSchema);
