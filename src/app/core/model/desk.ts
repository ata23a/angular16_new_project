class Desk {
  id: number;
  name: string;
  branch_id: number;
  description: string;
  audio_file: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  deleted_at: null
  Services: any[];

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default Desk;
