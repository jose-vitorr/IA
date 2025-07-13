const API_KEY = "AIzaSyD55Df8pa-xbkGrrN_2zenzRKbp_DtiaZM"
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const textInput = document.getElementById('text-input');
const imageInput = document.getElementById('image-input');
const statusMsg = document.getElementById('status-msg');

// Adiciona mensagem ao chat
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;  
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Converte imagem para Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(new Error("Falha ao ler a imagem"));
    reader.readAsDataURL(file);
  });
}

// Envia para a API do Gemini
async function sendToGemini(text, imageBase64, mimeType) {
  const parts = [];

  if (text) {
    parts.push({ text: "Você é um assistente que responde sempre em português.\n" + text });
  }

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }

  const body = {
    contents: [{
      parts: parts
    }]
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`); 
  }

  return await response.json();
}

// Evento do botão de enviar
sendBtn.addEventListener('click', async () => {
  const userText = textInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!userText && !imageFile) {
    alert("Por favor, digite uma mensagem OU envie uma imagem.");
    return;
  }

  addMessage(userText || "[Imagem enviada]", "user");
  textInput.value = "";
  imageInput.value = "";
  statusMsg.innerText = "Processando...";

  try {
    let imageBase64, mimeType;
    
    if (imageFile) {
      imageBase64 = await toBase64(imageFile);
      mimeType = imageFile.type;
    }

    const data = await sendToGemini(userText, imageBase64, mimeType);
    console.log("Resposta da API:", data);

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "A API não retornou uma resposta válida.";
    addMessage(botReply, "bot");
  } catch (err) {
    console.error("Erro:", err);
    addMessage(`Erro: ${err.message}`, "error"); 
  } finally {
    statusMsg.innerText = "";
  }
});
