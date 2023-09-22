class Queue {
  id: number;
  rank: number;
  audit: string;
  desk_id: string;
  service_id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  deleted_at: string;
  Desk: any;
  Service: any;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default Queue;
