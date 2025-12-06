/**
 * ShowImageWeb Cloudflare Worker 简化版
 * 专门用于 OpenAI 格式 API 调用
 */

// 默认配置
const CONFIG = {
    // 您的 OpenAI 兼容 API 配置
    endpoint: 'https://ai.gitee.com/v1',
    defaultApiKey: 'sk-zKTGcw8llBFZLpXAAsxTmMSmCfY8DNfe',
    defaultModel: 'z-image-turbo',
    defaultSize: '1024x1024',
    defaultSteps: 9
  };
  
  // CORS 配置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  /**
   * 处理 OPTIONS 请求
   */
  function handleOptions() {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  
  /**
   * 处理主页请求
   */
  function handleHome() {
    const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ShowImageWeb - AI图像生成器</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
          }
          .main-container {
              display: flex;
              gap: 30px;
              max-width: 1200px;
              width: 100%;
              padding: 20px;
          }
          .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.2);
              flex: 1;
          }
          .control-panel {
              min-width: 400px;
          }
          .result-panel {
              min-width: 400px;
              display: flex;
              flex-direction: column;
          }
          h1 {
              text-align: center;
              font-size: 2.5em;
              margin-bottom: 10px;
              background: linear-gradient(135deg, #ffffff, #f0f0f0);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 800;
          }
          .subtitle {
              text-align: center;
              font-size: 1.1em;
              margin-bottom: 30px;
              opacity: 0.9;
              color: rgba(255, 255, 255, 0.9);
          }
          .form-group {
              margin-bottom: 20px;
          }
          label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.95);
          }
          textarea, input, select {
              width: 100%;
              padding: 15px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              background: rgba(255, 255, 255, 0.1);
              color: white;
              font-size: 16px;
              transition: all 0.3s ease;
          }
          textarea {
              min-height: 120px;
              resize: vertical;
          }
          textarea:focus, input:focus, select:focus {
              outline: none;
              border-color: rgba(102, 126, 234, 0.8);
              background: rgba(255, 255, 255, 0.15);
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          }
          select option {
              color: #333;
              background: white;
          }
          input::placeholder, textarea::placeholder {
              color: rgba(255, 255, 255, 0.6);
          }
          button {
              width: 100%;
              padding: 18px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s ease;
              margin-top: 20px;
              position: relative;
              overflow: hidden;
          }
          button:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
          button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
          }
          .form-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
          }
          .slider-container {
              display: flex;
              align-items: center;
              gap: 10px;
          }
          input[type="range"] {
              flex: 1;
              -webkit-appearance: none;
              height: 6px;
              border-radius: 3px;
              background: rgba(255, 255, 255, 0.2);
              outline: none;
          }
          input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              cursor: pointer;
          }
          .result {
              margin-top: 30px;
              text-align: center;
          }
          .result img {
              max-width: 100%;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              margin-bottom: 20px;
          }
          .loading {
              display: inline-block;
              animation: spin 1s linear infinite;
          }
          @keyframes spin {
              to { transform: rotate(360deg); }
          }
          .error {
              background: rgba(255, 107, 107, 0.1);
              border: 1px solid #ff6b6b;
              color: #ff6b6b;
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 15px;
          }
          .success {
              background: rgba(81, 207, 102, 0.1);
              border: 1px solid #51cf66;
              color: #51cf66;
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 15px;
          }
          .download-btn {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              transition: all 0.3s ease;
          }
          .download-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 16px rgba(81, 207, 102, 0.3);
          }
          .info-badge {
              background: rgba(102, 126, 234, 0.1);
              border: 1px solid rgba(102, 126, 234, 0.3);
              color: rgba(255, 255, 255, 0.8);
              padding: 10px 15px;
              border-radius: 8px;
              font-size: 14px;
              margin-top: 10px;
          }
          .seed-btn {
              width: auto;
              padding: 15px 20px;
              background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s ease;
              margin: 0;
              min-width: 60px;
          }
          .seed-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(118, 75, 162, 0.3);
          }
          @media (max-width: 768px) {
              .main-container {
                  flex-direction: column;
                  gap: 20px;
              }
              .control-panel, .result-panel {
                  min-width: 100%;
              }
              .form-row {
                  grid-template-columns: 1fr;
              }
              .container {
                  padding: 25px;
              }
              h1 {
                  font-size: 2em;
              }
          }
      </style>
  </head>
  <body>
      <div class="main-container">
          <div class="container control-panel">
              <h1>ShowImageWeb</h1>
              <p class="subtitle">🎨 AI图像生成 - 将您的想象力转化为视觉艺术</p>

              <form onsubmit="generateImage(event)">
                  <div class="form-group">
                      <label for="prompt">✨ 描述您的创意</label>
                      <textarea
                          id="prompt"
                          placeholder="🎯 描述您的创意... 例如：一张虚构的英语电影《回忆之味》的海报，场景设置在质朴的19世纪风格厨房里..."
                          required
                      ></textarea>
                  </div>

                  <div class="form-row">
                      <div class="form-group">
                          <label for="model">🤖 模型</label>
                          <select id="model">
                              <option value="z-image-turbo">z-image-turbo</option>
                          </select>
                      </div>

                      <div class="form-group">
                          <label for="size">📐 尺寸</label>
                          <select id="size">
                              <option value="1024x1024">1024x1024</option>
                              <option value="2048x2048">2048x2048</option>
                          </select>
                      </div>

                      <div class="form-group">
                          <label for="steps">🔢 推理步数: <span id="stepsValue">9</span></label>
                          <input type="range" id="steps" min="1" max="50" value="9" oninput="document.getElementById('stepsValue').textContent = this.value">
                      </div>
                  </div>

                  <div class="form-row">
                      <div class="form-group">
                          <label for="seed">🎲 随机种子</label>
                          <div style="display: flex; gap: 10px;">
                              <input type="number" id="seed" value="42" min="1" style="flex: 1;">
                              <button type="button" onclick="randomizeSeed()" class="seed-btn">
                                  🎲
                              </button>
                          </div>
                      </div>

                      <div class="form-group">
                          <label for="apiKey">🔐 API Key (可选)</label>
                          <input type="password" id="apiKey" placeholder="sk-...">
                      </div>
                  </div>

                  <div class="info-badge">
                      💡 提示：使用 OpenAI 兼容格式 API，支持 z-image-turbo、dall-e-3 等模型
                  </div>

                  <button type="submit" id="generateBtn">
                      <span id="btnText">🚀 立即生成</span>
                  </button>
              </form>
          </div>

          <div class="container result-panel">
              <h2 style="text-align: center; font-size: 1.8em; margin-bottom: 20px; background: linear-gradient(135deg, #ffffff, #f0f0f0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">
                  生成结果
              </h2>
              <div id="result" class="result" style="flex: 1; overflow-y: auto;">
                  <div style="text-align: center; opacity: 0.7; padding: 40px;">
                      <div style="font-size: 3em; margin-bottom: 20px;">🎨</div>
                      <div style="font-size: 1.2em;">您的艺术作品将在这里显示...</div>
                  </div>
              </div>
          </div>
      </div>
  
      <script>
          // 随机种子功能
          function randomizeSeed() {
              const seedInput = document.getElementById('seed');
              const randomSeed = Math.floor(Math.random() * 1000000) + 1;
              seedInput.value = randomSeed;
          }

          async function generateImage(event) {
              event.preventDefault();
  
              const btn = document.getElementById('generateBtn');
              const btnText = document.getElementById('btnText');
              const result = document.getElementById('result');
  
              const prompt = document.getElementById('prompt').value.trim();
              if (!prompt) {
                  result.innerHTML = '<div class="error">⚠️ 请输入提示词</div>';
                  return;
              }
  
              // 获取表单数据
              const formData = {
                  prompt: prompt,
                  model: document.getElementById('model').value,
                  size: document.getElementById('size').value,
                  steps: parseInt(document.getElementById('steps').value),
                  apiKey: document.getElementById('apiKey').value.trim(),
                  seed: parseInt(document.getElementById('seed').value)
              };
  
              // 禁用按钮并显示加载状态
              btn.disabled = true;
              btnText.innerHTML = '<span class="loading">⏳</span> AI创作中...';

              // 保留现有图片，不清空结果区域
  
              try {
                  const response = await fetch('/generate', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(formData)
                  });
  
                  const data = await response.json();
  
                  if (response.ok && data.success) {
                      // 将新图片添加到现有内容上方
                      const newImageHtml = \`
                          <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; padding-bottom: 20px;">
                              <div class="success">🎉 生成成功！耗时: \${data.duration}秒</div>
                              <img src="data:image/png;base64,\${data.image}" alt="AI Generated Image">
                              <div>
                                  <a href="data:image/png;base64,\${data.image}"
                                     download="AI-Art-\${Date.now()}.png"
                                     class="download-btn">
                                      ⬇️ 下载图片
                                  </a>
                              </div>
                          </div>
                      \`;
                      result.innerHTML = newImageHtml + result.innerHTML;
                  } else {
                      // 如果是首次生成，显示错误信息
                      if (result.innerHTML.includes('等待生成您的艺术作品')) {
                          result.innerHTML = \`<div class="error">❌ \${data.error || '生成失败'}</div>\`;
                      } else {
                          // 在顶部添加错误信息，保留现有内容
                          result.innerHTML = \`<div class="error" style="margin-bottom: 20px;">❌ \${data.error || '生成失败'}</div>\` + result.innerHTML;
                      }
                  }
              } catch (error) {
                  // 如果是首次生成，显示错误信息
                  if (result.innerHTML.includes('等待生成您的艺术作品')) {
                      result.innerHTML = \`<div class="error">💥 网络错误: \${error.message}</div>\`;
                  } else {
                      // 在顶部添加错误信息，保留现有内容
                      result.innerHTML = \`<div class="error" style="margin-bottom: 20px;">💥 网络错误: \${error.message}</div>\` + result.innerHTML;
                  }
              } finally {
                  // 恢复按钮状态
                  btn.disabled = false;
                  btnText.innerHTML = '🚀 立即生成';
              }
          }
      </script>
  </body>
  </html>
    `;
  
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });
  }
  
  /**
   * 处理图像生成请求
   */
  async function handleGenerate(request) {
    try {
      const requestData = await request.json();
  
      const { prompt, model, size, steps, apiKey, seed } = requestData;
  
      // 使用提供的 API Key 或默认的
      const finalApiKey = apiKey || CONFIG.defaultApiKey;
  
      // 调用 OpenAI 兼容 API
      const requestBody = {
        prompt: prompt,
        model: model || CONFIG.defaultModel,
        size: size || CONFIG.defaultSize,
        extra_body: {
          num_inference_steps: steps || CONFIG.defaultSteps
        }
      };

      // 如果提供了种子，添加到请求中
      if (seed) {
        requestBody.seed = seed;
      }

      const apiRequest = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalApiKey}`
        },
        body: JSON.stringify(requestBody)
      };
  
      const startTime = Date.now();
  
      const apiResponse = await fetch(`${CONFIG.endpoint}/images/generations`, apiRequest);
  
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API错误: ${apiResponse.status} - ${errorText}`);
      }
  
      const apiData = await apiResponse.json();
  
      // 处理响应数据
      let imageBase64 = null;
      if (apiData.data && apiData.data.length > 0) {
        const imageData = apiData.data[0];
  
        if (imageData.url) {
          // 下载图片
          const imageResponse = await fetch(imageData.url);
          if (!imageResponse.ok) {
            throw new Error('图片下载失败');
          }
          const imageBuffer = await imageResponse.arrayBuffer();
          imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        } else if (imageData.b64_json) {
          // 直接使用 base64
          imageBase64 = imageData.b64_json;
        }
      }
  
      if (!imageBase64) {
        throw new Error('未获取到有效的图片数据');
      }
  
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
      return new Response(JSON.stringify({
        success: true,
        image: imageBase64,
        duration: duration
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
  
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
  
  /**
   * 主要的请求处理函数
   */
  export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
  
      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }
  
      // 路由处理
      switch (url.pathname) {
        case '/':
        case '/index.html':
          return handleHome();
  
        case '/generate':
          if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: '仅支持 POST 方法' }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          return handleGenerate(request);
  
        default:
          return new Response(JSON.stringify({ error: '页面未找到' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
      }
    }
  };