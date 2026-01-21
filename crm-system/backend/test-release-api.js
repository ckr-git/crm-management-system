const axios = require('axios');

async function testReleaseAPI() {
  try {
    // 1. 先登录获取token
    console.log('1. 登录获取token...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功，token:', token.substring(0, 20) + '...');
    
    // 2. 获取客户列表
    console.log('\n2. 获取客户列表...');
    const customersRes = await axios.get('http://localhost:3000/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const customer = customersRes.data.data.list[0];
    console.log('✅ 获取到客户:', customer.id, customer.name);
    
    // 3. 尝试释放到公海
    console.log('\n3. 尝试释放客户到公海...');
    try {
      const releaseRes = await axios.post('http://localhost:3000/api/customer-pool/release', {
        customer_id: customer.id,
        reason: '测试释放到公海功能'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ 释放成功!');
      console.log('响应数据:', JSON.stringify(releaseRes.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log('❌ 释放失败');
        console.log('状态码:', error.response.status);
        console.log('错误消息:', error.response.data.message);
        console.log('完整响应:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('❌ 请求失败:', error.message);
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.data);
    }
  }
}

testReleaseAPI();
