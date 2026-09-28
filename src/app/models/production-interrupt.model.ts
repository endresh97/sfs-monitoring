export interface ProductionInterrupt {
  timestamp: number;
  status: 'stopped' | 'maintenance';
}
