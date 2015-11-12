# TV App Debug
WebSocket сервер и клиент для отладки SmartTV приложений

## Сервер (server.js)
Проксирует сообщения между клиентами

options:

- `--port`: по умолчанию 3000

`node server.js --port 3000`

## Клиент (client.js)
Логирует сообщения `app:info` от приложений, следит за файлом (по умолчанию `eval.js`)
и посылает его содержимое на исполнение приложению `dev:eval`

options:

- `-h` : адрес ws сервера
- `-f` : файл с javascript кодом для исполнения по умолчанию `eval.js`

`node client.js -h http://localhost:3000 -f eval.js` 

## Logger.js
Логирует сообщения `app:info` и исполняет код пришедший в сообщении `dev:eval`

options:

- `intercept`: включить перехват вызовов console.log, window alert

```javascript

var socket = io('http://localhost:3000');

logger({
    intercept: true,
    socketio: socket
});


var debug = logger('app');

debug('log');

```