// api/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
const PORT = 5001;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 用户登录
app.post('/api/login', async (req, res) => {
  const { email, pin } = req.body;

  if (pin === '1234') {
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (users) {
      res.json({ success: true, user: users });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or PIN' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// 获取所有预约
app.get('/api/bookings', async (req, res) => {
  const { data: bookings, error } = await supabase.from('courses').select('date, users(name, email), materials').eq('users.email', 'courses.email');

  if (error) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }

  res.json(bookings);
});

// 创建预约
app.post('/api/bookings', async (req, res) => {
  const { date, email, materials } = req.body;
  const { data, error } = await supabase.from('courses').insert([{ date, email, materials }]);

  if (error) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }

  res.json({ success: true, data });
});

// 取消预约
app.delete('/api/bookings/:date', async (req, res) => {
  const { date } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const { error } = await supabase.from('courses').delete().eq('date', date).eq('email', email);

  if (error) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }

  res.json({ success: true });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
