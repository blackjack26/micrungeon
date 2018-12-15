const { app, BrowserWindow, globalShortcut } = require( 'electron' );
const os = require( 'os' );

let mainWindow = null;

app.setName( 'Micrungeon' );
app.on( 'ready', () => {
  mainWindow = new BrowserWindow( {
    backgroundColor: 'lightgray',
    title: 'Micrungeon',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8'
    }
  } );
  mainWindow.setFullScreen( true );

  const platform = os.platform();
  if ( platform === 'darwin' ) {
    globalShortcut.register( 'Command+Option+I', () => {
      mainWindow.webContents.openDevTools();
    } );
  }
  else if ( platform === 'linux' || platform === 'win32' ) {
    globalShortcut.register( 'Control+Shift+I', () => {
      mainWindow.webContents.openDevTools();
    } );
  }

  mainWindow.once( 'ready-to-show', () => {
    mainWindow.setMenu( null );
    mainWindow.show();
  } );

  mainWindow.onbeforeunload = ( e ) => {
    // Prevent Command-R from unloading the window contents.
    e.returnValue = false;
  };

  mainWindow.on( 'closed', () => {
    mainWindow = null;
  } );

  mainWindow.loadURL( `file://${__dirname}/app/index.html` );
} );

app.on( 'window-all-closed', () => {
  app.quit();
} );