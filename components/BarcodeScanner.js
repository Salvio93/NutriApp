import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Camera, useCameraDevice,useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

export default function BarcodeScanner({ onScanned }) {
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);
  const isShowing = useRef(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8', 'qr'],
    onCodeScanned: useCallback((codes) => {
      const value = codes[0]?.value;
      if (!value || isShowing.current) return;
      isShowing.current = true;
      onScanned(value);
      setTimeout(() => (isShowing.current = false), 1000);
    }, [onScanned]),
  });

  // Ask for camera permission on mount
  useEffect(() => {
    (async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status === 'authorized') {
        setHasPermission(true);
      } else {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'authorized');
      }
    })();
  }, []);
  
  
  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        codeScanner={codeScanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
