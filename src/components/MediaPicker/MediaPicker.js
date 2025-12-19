// import {StyleSheet, View} from 'react-native';
// import React from 'react';
// import Button from '../Button/Button';
// import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// const MediaPicker = ({
//   onMediaSelected,
//   bottomSheetRef,
//   sheetHeights = ['25%'],
// }) => {
//   const openCamera = () => {
//     launchCamera(
//       {
//         mediaType: 'mixed',
//         cameraType: 'back',
//         saveToPhotos: true,
//       },
//       response => {
//         if (response.didCancel) return;
//         if (response.errorMessage) {
//           console.log('Camera Error:', response.errorMessage);
//           return;
//         }

//         const selected = response.assets || [];
//         onMediaSelected(prev => [...prev, ...selected]);
//       },
//     );
//   };

//   const launchGallery = () => {
//     launchImageLibrary(
//       {
//         mediaType: 'mixed', // allows both images & videos
//         selectionLimit: 0, // 0 = multiple files allowed
//       },
//       response => {
//         if (response.didCancel) return;
//         if (response.errorMessage) {
//           console.log('Picker Error:', response.errorMessage);
//           return;
//         }

//         const selected = response.assets || [];
//         // Merge new files with previous ones (avoid duplicates)
//         onMediaSelected(prev => {
//           const allFiles = [...prev, ...selected];
//           return Array.from(new Map(allFiles.map(f => [f.uri, f])).values());
//         });
//       },
//     );
//   };
//   const openPickerSheet = () => {
//     bottomSheetRef.current?.openSheet(
//       'media',
//       {
//         onCameraPress: openCamera,
//         onGalleryPress: launchGallery,
//       },
//       sheetHeights,
//     );
//   };

//   return (
//     <View>
//       <Button
//         Title="Pick Media"
//         BackgroundColor={'Background3'}
//         TextColor={'Text2'}
//         onPressChanges={openPickerSheet}
//       />
//     </View>
//   );
// };

// export default MediaPicker;

// const styles = StyleSheet.create({});
