const compact = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const tokenize = (message) => {
  const matches = message.match(/"[^"]*"|\S+/g) || [];
  return matches.map((token) => token.replace(/^"|"$/g, ''));
};

const parseNamedArgs = (tokens) =>
  tokens.reduce((acc, token) => {
    const separatorIndex = token.indexOf('=');
    if (separatorIndex === -1) return acc;

    const key = compact(token.slice(0, separatorIndex));
    const value = token.slice(separatorIndex + 1).trim();

    if (key && value) acc[key] = value;
    return acc;
  }, {});

const findByIdOrName = (items, value, labelBuilder = (item) => item.nombre || item.id) => {
  if (!value) return null;
  const normalizedTarget = compact(value);
  return items.find((item) => compact(item.id) === normalizedTarget || compact(labelBuilder(item)) === normalizedTarget) || null;
};

const resolveCompany = (state, args) => {
  if (!state.companies.length) {
    throw new Error('No hay empresas cargadas en el workspace compartido.');
  }

  if (args.empresa) {
    const company = findByIdOrName(state.companies, args.empresa);
    if (!company) {
      throw new Error(`No encontre la empresa "${args.empresa}".`);
    }
    return company;
  }

  const activeCompany = state.companies.find((company) => company.id === state.activeCompanyId);
  return activeCompany || state.companies[0];
};

const resolveCrop = (state, companyId, cropValue) => {
  if (!cropValue) return null;
  const companyCrops = state.crops.filter((item) => item.companyId === companyId);
  const crop = findByIdOrName(companyCrops, cropValue, (item) => `${item.cultivo} ${item.lote}`);

  if (!crop) {
    throw new Error(`No encontre el cultivo "${cropValue}" para esa empresa.`);
  }

  return crop;
};

const resolveSupplier = (state, companyId, supplierValue) => {
  if (!supplierValue) return null;
  const companySuppliers = state.suppliers.filter((item) => item.companyId === companyId);
  const supplier = findByIdOrName(companySuppliers, supplierValue);

  if (!supplier) {
    throw new Error(`No encontre el proveedor "${supplierValue}".`);
  }

  return supplier;
};

const resolveCustomer = (state, companyId, customerValue) => {
  if (!customerValue) return null;
  const companyCustomers = state.customers.filter((item) => item.companyId === companyId);
  const customer = findByIdOrName(companyCustomers, customerValue);

  if (!customer) {
    throw new Error(`No encontre el cliente "${customerValue}".`);
  }

  return customer;
};

const assertDate = (value, fieldName) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    throw new Error(`El campo ${fieldName} debe venir como YYYY-MM-DD.`);
  }
};

const parseExpenseCommand = (state, args) => {
  const company = resolveCompany(state, args);
  const crop = resolveCrop(state, company.id, args.cultivo || args.cropid);
  const supplier = resolveSupplier(state, company.id, args.proveedor || args.supplierid);
  const amount = Number(args.monto);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Para crear un gasto debes enviar un monto valido. Ejemplo: monto=3500');
  }

  if (!args.fecha) {
    throw new Error('Para crear un gasto debes enviar fecha=YYYY-MM-DD.');
  }

  assertDate(args.fecha, 'fecha');

  return {
    collection: 'expenses',
    confirmation: `Gasto creado en ${company.nombre} por USD ${amount}.`,
    payload: {
      companyId: company.id,
      cropId: crop?.id || null,
      supplierId: supplier?.id || null,
      fecha: args.fecha,
      categoria: args.categoria || 'Otros',
      labor: args.labor || '',
      concepto: args.concepto || '',
      numeroFactura: args.factura || '',
      monto: amount,
      estado: args.estado || 'pendiente',
      horas: args.horas ? Number(args.horas) : null,
      annual: compact(args.anual) === 'si'
    }
  };
};

const parseIncomeCommand = (state, args) => {
  const company = resolveCompany(state, args);
  const crop = resolveCrop(state, company.id, args.cultivo || args.cropid);
  const customer = resolveCustomer(state, company.id, args.cliente || args.customerid);
  const category = args.categoria || 'Venta granos';

  if (!args.fecha) {
    throw new Error('Para crear un ingreso debes enviar fecha=YYYY-MM-DD.');
  }

  assertDate(args.fecha, 'fecha');

  if (compact(category) === 'otros') {
    const amount = Number(args.monto);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Para un ingreso de categoria Otros debes enviar monto=...');
    }

    return {
      collection: 'incomes',
      confirmation: `Ingreso creado en ${company.nombre} por USD ${amount}.`,
      payload: {
        companyId: company.id,
        fecha: args.fecha,
        categoria: 'Otros',
        cropId: null,
        customerId: customer?.id || null,
        detalle: args.detalle || args.concepto || '',
        toneladas: 0,
        precio: 0,
        precioFinal: null,
        totalAntesDescuentos: amount,
        total: amount,
        plazoVenta: null,
        estado: args.estado || 'pendiente'
      }
    };
  }

  const toneladas = Number(args.toneladas);
  const precio = Number(args.precio);

  if (!crop) {
    throw new Error('Para una venta de granos debes indicar cultivo="Soja Norte" o cropId=...');
  }

  if (!Number.isFinite(toneladas) || toneladas <= 0) {
    throw new Error('Debes enviar toneladas=... para el ingreso.');
  }

  if (!Number.isFinite(precio) || precio <= 0) {
    throw new Error('Debes enviar precio=... para el ingreso.');
  }

  const totalAntesDescuentos = args.totalantesdescuentos ? Number(args.totalantesdescuentos) : toneladas * precio;
  const total = args.total ? Number(args.total) : totalAntesDescuentos;

  return {
    collection: 'incomes',
    confirmation: `Ingreso creado en ${company.nombre} por USD ${total}.`,
    payload: {
      companyId: company.id,
      fecha: args.fecha,
      categoria: 'Venta granos',
      cropId: crop.id,
      customerId: customer?.id || null,
      detalle: args.detalle || '',
      toneladas,
      precio,
      precioFinal: toneladas > 0 ? total / toneladas : null,
      totalAntesDescuentos,
      total,
      plazoVenta: args.plazo || args.plazoventa || 'Contado',
      estado: args.estado || 'pendiente'
    }
  };
};

export const helpMessage = [
  'Comandos disponibles:',
  'gasto monto=3500 categoria=Gasoil fecha=2026-04-06 concepto="Carga gasoil"',
  'ingreso toneladas=120 precio=450 cultivo="Soja Norte" fecha=2026-04-06 cliente=Cargill',
  'ingreso categoria=Otros monto=900 fecha=2026-04-06 detalle="Servicio de flete"',
  'Opcional: empresa="JP Agricultura", proveedor="AgroInsumos SA", estado=pagado'
].join('\n');

export const parseWhatsappMessage = (state, message) => {
  const tokens = tokenize(message);
  const [rawCommand, ...rest] = tokens;
  const command = compact(rawCommand);
  const args = parseNamedArgs(rest);

  if (!command || ['ayuda', 'help', 'hola'].includes(command)) {
    return { type: 'help', message: helpMessage };
  }

  if (command === 'gasto') {
    return { type: 'create', ...parseExpenseCommand(state, args) };
  }

  if (command === 'ingreso') {
    return { type: 'create', ...parseIncomeCommand(state, args) };
  }

  throw new Error('No entendi el comando. Escribe "ayuda" para ver ejemplos.');
};
