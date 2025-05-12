const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario que hace la llamada es admin
  if (!context.auth.token.admin === true) {
    throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden eliminar usuarios');
  }

  try {
    await admin.auth().deleteUser(data.uid);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error al eliminar usuario de Authentication');
  }
});