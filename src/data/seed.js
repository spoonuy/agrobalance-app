export const seedData = {
  currentUser: {
    id: 'admin-1',
    nombre: 'Mauricio López',
    email: 'mauricio@agrobalance.app',
    rol: 'superadmin',
    estado: 'activo'
  },
  users: [
    { id: 'admin-1', nombre: 'Mauricio López', email: 'mauricio@agrobalance.app', rol: 'superadmin', estado: 'activo' },
    { id: 'user-1', nombre: 'Carlos Pereira', email: 'carlos@jpagricultura.com', rol: 'usuario', estado: 'pendiente' }
  ],
  companies: [
    { id: 'comp-1', userId: 'admin-1', nombre: 'JP Agricultura', pais: 'Uruguay', moneda: 'USD' },
    { id: 'comp-2', userId: 'admin-1', nombre: 'Campo Norte SAS', pais: 'Uruguay', moneda: 'USD' }
  ],
  activeCompanyId: 'comp-1',
  fields: [
    { id: 'field-1', companyId: 'comp-1', nombre: 'La Esperanza', hectareas: 190, ubicacion: 'Soriano' },
    { id: 'field-2', companyId: 'comp-1', nombre: 'El Molino', hectareas: 110, ubicacion: 'Colonia' }
  ],
  campaigns: [
    { id: 'camp-1', companyId: 'comp-1', nombre: '2025/2026', anioInicio: 2025, anioFin: 2026 },
    { id: 'camp-2', companyId: 'comp-1', nombre: '2024/2025', anioInicio: 2024, anioFin: 2025 }
  ],
  crops: [
    { id: 'crop-1', companyId: 'comp-1', fieldId: 'field-1', campaignId: 'camp-1', cultivo: 'Soja', lote: 'Norte', hectareas: 120, siembra: '2025-10-15', cosecha: '2026-03-10', rentaHa: 180 },
    { id: 'crop-2', companyId: 'comp-1', fieldId: 'field-2', campaignId: 'camp-1', cultivo: 'Maíz', lote: 'Este', hectareas: 100, siembra: '2025-09-12', cosecha: '2026-02-05', rentaHa: 165 },
    { id: 'crop-3', companyId: 'comp-1', fieldId: 'field-2', campaignId: 'camp-2', cultivo: 'Trigo', lote: 'Sur', hectareas: 80, siembra: '2024-06-05', cosecha: '2024-12-20', rentaHa: 120 }
  ],
  suppliers: [
    { id: 'sup-1', companyId: 'comp-1', nombre: 'AgroInsumos SA', telefono: '+598 99 000 001', email: 'ventas@agroinsumos.com' },
    { id: 'sup-2', companyId: 'comp-1', nombre: 'Siembra SRL', telefono: '+598 99 000 002', email: 'info@siembrasrl.com' }
  ],
  customers: [
    { id: 'cus-1', companyId: 'comp-1', nombre: 'Cargill', telefono: '+598 99 200 001', email: 'uruguay@cargill.com' },
    { id: 'cus-2', companyId: 'comp-1', nombre: 'ADM', telefono: '+598 99 200 002', email: 'uy@adm.com' }
  ],
  expenses: [
    { id: 'exp-1', companyId: 'comp-1', cropId: 'crop-1', supplierId: 'sup-1', fecha: '2025-09-10', categoria: 'Semillas', labor: 'Siembra', concepto: 'Semilla Soja', monto: 17000, estado: 'pendiente', horas: null, annual: false },
    { id: 'exp-2', companyId: 'comp-1', cropId: 'crop-1', supplierId: 'sup-1', fecha: '2025-09-22', categoria: 'Fertilizantes', labor: 'Fertilización', concepto: 'Urea', monto: 23000, estado: 'pagado', horas: null, annual: false },
    { id: 'exp-3', companyId: 'comp-1', cropId: 'crop-2', supplierId: 'sup-2', fecha: '2025-10-05', categoria: 'Flete', labor: 'Transporte', concepto: 'Flete maíz', monto: 4500, estado: 'pendiente', horas: null, annual: false },
    { id: 'exp-4', companyId: 'comp-1', cropId: null, supplierId: null, fecha: '2025-04-15', categoria: 'Maquinaria', labor: 'Mantenimiento', concepto: 'Cambio de aceite tractor', monto: 300, estado: 'pagado', horas: 5000, annual: true },
    { id: 'exp-5', companyId: 'comp-1', cropId: null, supplierId: null, fecha: '2025-06-30', categoria: 'Personal', labor: 'Sueldos', concepto: 'Sueldos junio', monto: 2950, estado: 'pagado', horas: null, annual: true }
  ],
  incomes: [
    { id: 'inc-1', companyId: 'comp-1', cropId: 'crop-1', customerId: 'cus-1', fecha: '2026-03-14', toneladas: 180, precio: 450, total: 81000, estado: 'pendiente' },
    { id: 'inc-2', companyId: 'comp-1', cropId: 'crop-1', customerId: 'cus-2', fecha: '2026-04-10', toneladas: 120, precio: 460, total: 55200, estado: 'cobrado' },
    { id: 'inc-3', companyId: 'comp-1', cropId: 'crop-2', customerId: 'cus-1', fecha: '2026-02-28', toneladas: 150, precio: 220, total: 33000, estado: 'pendiente' }
  ],
  grainLocations: [
    { id: 'gl-1', companyId: 'comp-1', nombre: 'Silo bolsa La Esperanza', tipo: 'Campo propio' },
    { id: 'gl-2', companyId: 'comp-1', nombre: 'Acopio Barraca Central', tipo: 'Acopio' }
  ],
  grainStock: [
    { id: 'gs-1', companyId: 'comp-1', cropId: 'crop-1', locationId: 'gl-1', cantidadKg: 125000, fecha: '2026-03-20' },
    { id: 'gs-2', companyId: 'comp-1', cropId: 'crop-2', locationId: 'gl-2', cantidadKg: 70000, fecha: '2026-02-20' }
  ],
  rainfallRecords: [
    { id: 'rain-1', companyId: 'comp-1', fecha: '2025-01-12', mm: 18, observaciones: 'Lluvia pareja' },
    { id: 'rain-2', companyId: 'comp-1', fecha: '2025-02-03', mm: 32, observaciones: 'Tormenta nocturna' },
    { id: 'rain-3', companyId: 'comp-1', fecha: '2025-03-21', mm: 12, observaciones: '' },
    { id: 'rain-4', companyId: 'comp-1', fecha: '2025-09-14', mm: 45, observaciones: 'Aporte para siembra' },
    { id: 'rain-5', companyId: 'comp-1', fecha: '2025-10-02', mm: 27, observaciones: '' },
    { id: 'rain-6', companyId: 'comp-1', fecha: '2025-11-18', mm: 54, observaciones: 'Lluvia fuerte' },
    { id: 'rain-7', companyId: 'comp-1', fecha: '2026-01-07', mm: 16, observaciones: '' },
    { id: 'rain-8', companyId: 'comp-1', fecha: '2026-02-11', mm: 38, observaciones: '' },
    { id: 'rain-9', companyId: 'comp-1', fecha: '2026-03-29', mm: 22, observaciones: 'Fin de mes' }
  ],
  deliveryNotes: [
    { id: 'rem-1', companyId: 'comp-1', cropId: 'crop-1', fecha: '2026-03-12', matricula: 'STP 1234', destino: 'Acopio Central', kgAproximados: 31500, kgReales: 30980 },
    { id: 'rem-2', companyId: 'comp-1', cropId: 'crop-1', fecha: '2026-03-14', matricula: 'SCT 4412', destino: 'Acopio Central', kgAproximados: 32000, kgReales: 32340 },
    { id: 'rem-3', companyId: 'comp-1', cropId: 'crop-2', fecha: '2026-02-09', matricula: 'SBM 9081', destino: 'Planta Norte', kgAproximados: 28000, kgReales: 27620 }
  ],
  machinery: [
    { id: 'mach-1', companyId: 'comp-1', nombre: 'Tractor John Deere 6125', tipo: 'Tractor', marca: 'John Deere', modelo: '6125', horasActuales: 5200 },
    { id: 'mach-2', companyId: 'comp-1', nombre: 'Cosechadora Case 2388', tipo: 'Cosechadora', marca: 'Case', modelo: '2388', horasActuales: 3800 }
  ],
  machineryMaintenance: [
    { id: 'mm-1', companyId: 'comp-1', machineryId: 'mach-1', fecha: '2025-04-15', concepto: 'Cambio de aceite', horas: 5000, costo: 300 },
    { id: 'mm-2', companyId: 'comp-1', machineryId: 'mach-2', fecha: '2025-07-12', concepto: 'Cubierta', horas: 3600, costo: 500 }
  ],
  employees: [
    { id: 'emp-1', companyId: 'comp-1', nombre: 'Juan Rodríguez', cargo: 'Encargado', fechaIngreso: '2023-02-01', sueldo: 1400 },
    { id: 'emp-2', companyId: 'comp-1', nombre: 'Pedro Gómez', cargo: 'Tractorista', fechaIngreso: '2024-03-10', sueldo: 1150 }
  ],
  salaryEntries: [
    { id: 'sal-1', companyId: 'comp-1', employeeId: 'emp-1', mes: '2025-06', tipo: 'Sueldo', monto: 1400 },
    { id: 'sal-2', companyId: 'comp-1', employeeId: 'emp-1', mes: '2025-06', tipo: 'Aguinaldo', monto: 700 },
    { id: 'sal-3', companyId: 'comp-1', employeeId: 'emp-2', mes: '2025-06', tipo: 'Sueldo', monto: 1150 },
    { id: 'sal-4', companyId: 'comp-1', employeeId: 'emp-2', mes: '2025-06', tipo: 'Licencia', monto: 460 }
  ]
};
