import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {version as bottomSheetVersion} from './node_modules/@gorhom/bottom-sheet/package.json';
import {version as reanimatedVersion} from './node_modules/react-native-reanimated/package.json';
import {version as reactNativeVersion} from './node_modules/react-native/package.json';

const {height: SCREEN_HEIGHT} = Dimensions.get('screen');

const DELAY_BEFORE_MOUNT = 2000;
const DELAY_BEFORE_SNAP = 1000;

const App = () => {
  // state
  const [end, setEnd] = useState(false);
  const [mount, setMount] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => [150, 300, 450], []);
  const initialSnapPoint = useRef(0);
  const startPerfTime = useRef(0);
  const endPerfTime = useRef(0);

  // callbacks
  const handleOnContentLayout = useCallback(() => {
    endPerfTime.current = Date.now();
    setShowResult(true);
  }, []);

  const doMountBottomSheet = useCallback(() => {
    startPerfTime.current = Date.now();
    setMount((state) => !state);
  }, []);

  const doStartAutoSnapping = useCallback(() => {
    let index = 0;
    let loop = 1;

    const timer = setInterval(() => {
      if (loop === 4) {
        clearInterval(timer);
        setEnd((state) => !state);
        return;
      }

      if (index > snapPoints.length - 1) {
        index = 0;
        loop++;
      }

      bottomSheetRef.current?.snapTo(index++);
    }, DELAY_BEFORE_SNAP);

    return () => {
      clearInterval(timer);
    };
  }, [snapPoints]);

  // effects
  useEffect(() => {
    const timeout = setTimeout(() => {
      doMountBottomSheet();
      clearTimeout(timeout);
    }, DELAY_BEFORE_MOUNT);

    return () => {
      clearTimeout(timeout);
    };
  }, [doMountBottomSheet]);
  useEffect(() => {
    if (mount) {
      doStartAutoSnapping();
    }
  }, [mount, doStartAutoSnapping]);
  // render
  return end ? (
    <View style={styles.endContainer} />
  ) : (
    <View style={styles.container}>
      <Text style={styles.version}>React Native v{reactNativeVersion}</Text>
      <Text style={styles.version}>Bottom Sheet v{bottomSheetVersion}</Text>
      <Text style={styles.version}>Reanimated v{reanimatedVersion}</Text>

      {showResult && (
        <Text style={styles.measure}>
          {endPerfTime.current - startPerfTime.current}ms
        </Text>
      )}

      {mount && (
        <BottomSheet
          ref={bottomSheetRef}
          index={initialSnapPoint.current}
          snapPoints={snapPoints}
          animateOnMount={true}
          containerHeight={SCREEN_HEIGHT}>
          <View style={styles.content} onLayout={handleOnContentLayout} />
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    backgroundColor: '#000',
  },
  endContainer: {
    flex: 1,
    backgroundColor: 'red',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginHorizontal: 24,
    marginBottom: 6,
  },
  measure: {
    marginHorizontal: 24,
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  version: {
    marginHorizontal: 24,
    marginTop: 12,
    color: 'white',
    fontSize: 20,
  },
});

export default App;
