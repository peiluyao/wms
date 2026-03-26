import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import sqlite3 from 'sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Initialization
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: './wms.sqlite'
    },
    useNullAsDefault: true
  });

  // Create Tables
  await db.schema.hasTable('users').then(exists => {
    if (!exists) {
      return db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('username').unique();
        table.string('password');
        table.string('name');
        table.string('role');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('materials').then(exists => {
    if (!exists) {
      return db.schema.createTable('materials', table => {
        table.increments('id').primary();
        table.string('code').unique();
        table.string('name');
        table.string('spec');
        table.string('unit');
        table.float('weight');
        table.string('remark');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('locations').then(exists => {
    if (!exists) {
      return db.schema.createTable('locations', table => {
        table.increments('id').primary();
        table.string('code').unique();
        table.string('name');
        table.string('area');
        table.integer('max_capacity');
        table.string('remark');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('inventory').then(exists => {
    if (!exists) {
      return db.schema.createTable('inventory', table => {
        table.increments('id').primary();
        table.integer('material_id').references('id').inTable('materials');
        table.integer('location_id').references('id').inTable('locations');
        table.integer('qty').defaultTo(0);
        table.timestamp('last_updated_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('orders').then(exists => {
    if (!exists) {
      return db.schema.createTable('orders', table => {
        table.increments('id').primary();
        table.string('order_no').unique();
        table.string('type'); // INBOUND, OUTBOUND
        table.string('status'); // PENDING, COMPLETED, CANCELLED
        table.string('remark');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
    }
  });

  await db.schema.hasTable('order_items').then(exists => {
    if (!exists) {
      return db.schema.createTable('order_items', table => {
        table.increments('id').primary();
        table.integer('order_id').references('id').inTable('orders');
        table.integer('material_id').references('id').inTable('materials');
        table.integer('location_id').references('id').inTable('locations');
        table.integer('qty');
      });
    }
  });

  // Seed Admin User
  const admin = await db('users').where({ username: 'admin' }).first();
  if (!admin) {
    await db('users').insert({
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      role: 'ADMIN'
    });
  }

  // Seed Materials
  const materialCount = await db('materials').count('id as count').first();
  if (materialCount?.count === 0) {
    await db('materials').insert([
      { code: 'M001', name: '不锈钢螺栓', spec: 'M8*20', unit: '件', weight: 0.05, remark: '原材料' },
      { code: 'M002', name: '铝合金支架', spec: 'L-Type', unit: '个', weight: 0.45, remark: '半成品' },
      { code: 'M003', name: '控制面板', spec: 'V2.0', unit: '块', weight: 1.2, remark: '核心组件' },
      { code: 'M004', name: '包装纸箱', spec: '400*300*200', unit: '个', weight: 0.3, remark: '耗材' }
    ]);
  }

  // Seed Locations
  const locationCount = await db('locations').count('id as count').first();
  if (locationCount?.count === 0) {
    await db('locations').insert([
      { code: 'A-01-01', name: 'A区01排01位', area: 'A', max_capacity: 1000, remark: '重型货架' },
      { code: 'A-01-02', name: 'A区01排02位', area: 'A', max_capacity: 1000, remark: '重型货架' },
      { code: 'B-02-01', name: 'B区02排01位', area: 'B', max_capacity: 500, remark: '中型货架' },
      { code: 'C-03-01', name: 'C区03排01位', area: 'C', max_capacity: 2000, remark: '平库区' }
    ]);
  }

  // Middleware
  app.use(express.json());

  // API Routes
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db('users').where({ username, password }).first();
    if (user) {
      res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  });

  // Materials API
  app.get('/api/materials', async (req, res) => {
    const materials = await db('materials').select('*');
    res.json(materials);
  });

  app.post('/api/materials', async (req, res) => {
    const [id] = await db('materials').insert(req.body);
    res.json({ id, ...req.body });
  });

  // Locations API
  app.get('/api/locations', async (req, res) => {
    const locations = await db('locations').select('*');
    res.json(locations);
  });

  // Inventory API
  app.get('/api/inventory', async (req, res) => {
    const inventory = await db('inventory')
      .join('materials', 'inventory.material_id', 'materials.id')
      .join('locations', 'inventory.location_id', 'locations.id')
      .select(
        'inventory.*', 
        'materials.name as material_name', 
        'materials.code as material_code', 
        'locations.name as location_name', 
        'locations.code as location_code',
        'locations.area'
      );
    res.json(inventory);
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    const orders = await db('orders').select('*').orderBy('created_at', 'desc');
    res.json(orders);
  });

  app.post('/api/orders', async (req, res) => {
    const { order_no, type, items, remark } = req.body;
    await db.transaction(async trx => {
      const [order_id] = await trx('orders').insert({
        order_no,
        type,
        status: 'COMPLETED', // Auto-complete for simplicity
        remark,
        created_at: db.fn.now()
      });

      for (const item of items) {
        await trx('order_items').insert({
          order_id,
          material_id: item.material_id,
          location_id: item.location_id,
          qty: item.qty
        });

        // Update Inventory
        const existing = await trx('inventory')
          .where({ material_id: item.material_id, location_id: item.location_id })
          .first();

        if (type === 'INBOUND') {
          if (existing) {
            await trx('inventory')
              .where({ id: existing.id })
              .update({ qty: existing.qty + item.qty, last_updated_at: db.fn.now() });
          } else {
            await trx('inventory').insert({
              material_id: item.material_id,
              location_id: item.location_id,
              qty: item.qty,
              last_updated_at: db.fn.now()
            });
          }
        } else if (type === 'OUTBOUND') {
          if (existing && existing.qty >= item.qty) {
            await trx('inventory')
              .where({ id: existing.id })
              .update({ qty: existing.qty - item.qty, last_updated_at: db.fn.now() });
          } else {
            throw new Error('库存不足');
          }
        }
      }
    });
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get('/api/stats', async (req, res) => {
    const materialCount = await db('materials').count('id as count').first();
    const locationCount = await db('locations').count('id as count').first();
    const orderCount = await db('orders').count('id as count').first();
    const totalInventory = await db('inventory').sum('qty as sum').first();

    res.json({
      materialCount: materialCount?.count || 0,
      locationCount: locationCount?.count || 0,
      orderCount: orderCount?.count || 0,
      totalInventory: totalInventory?.sum || 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // Use custom to handle index.html manually
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
