import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export const useMediaPicker = () => {
  const pickFromCamera = async ({
    type = 'mixed',
  }) => {
    return new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: type,
          cameraType: 'back',
          saveToPhotos: true,
        },
        response => {
          if (response.didCancel) return resolve([]);
          if (response.errorMessage) {
            console.log('Camera Error:', response.errorMessage);
            return resolve([]);
          }

          resolve(response.assets || []);
        },
      );
    });
  };

  const pickFromGallery = async ({
    type = 'mixed',
    limit = 0, // 0 = unlimited
  }) => {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: type,
          selectionLimit: limit === 0 ? 0 : limit,
        },
        response => {
          if (response.didCancel) return resolve([]);
          if (response.errorMessage) {
            console.log('Camera Error:', response.errorMessage);
            return resolve([]);
          }

          resolve(response.assets || []);
        },
      );
    });
  };

  return {pickFromCamera, pickFromGallery};
};
