import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme/colors/colors';
import {CopyrightFooter} from '../components/Copyright/CopyrightFooter';
import {
  HouseHeart,
  BadgePlus,
  Bell,
  // Calendar,
  User,
  Search,
} from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import VisitProfileScreen from '../screens/VisitProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SearchScreen from '../screens/SearchScreen';
import AppBottomSheet from '../components/Custom/AppBottomSheet';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditNametagScreen from '../screens/EditNametagScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// const ScreenWithCopyright = ({children}) => {
//   return (
//     <SafeAreaView style={copyrightStyles.screenContainer}>
//       <View style={copyrightStyles.content}>{children}</View>
//       <CopyrightFooter />
//     </SafeAreaView>
//   );
// };
const TabNavigator = ({bottomSheetRef}) => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({route}) => ({
          // headerShown: false,
          tabBarStyle: {
            height: 80, // Adjust height as needed
            paddingBottom: 20, // Adjust spacing for icons and labels
            paddingTop: 10, // Optional: Adjust top padding for better alignment
          },
          tabBarShowLabel: true,
          tabBarInactiveTintColor: colors.lightText,
          tabBarActiveTintColor: colors.Primary,
          tabBarHideOnKeyboard: true,
        })}>
        <Tab.Screen
          name="Home"
          // component={HomeScreen}
          options={{
            title: 'Home',
            tabBarIcon: ({focused, color, size}) => (
              <HouseHeart size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}>
          {props => <HomeScreen {...props} bottomSheetRef={bottomSheetRef} />}
        </Tab.Screen>

        {/* <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            title: 'Calendar',
            tabBarIcon: ({focused, color, size}) => (
              <Calendar size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}
        /> */}
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            title: 'Notification',
            tabBarIcon: ({focused, color, size}) => (
              <Bell size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Create"
          // component={CreateScreen}
          options={{
            title: 'Create',
            tabBarIcon: ({focused, color, size}) => (
              <BadgePlus size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}>
          {props => <CreateScreen {...props} bottomSheetRef={bottomSheetRef} />}
        </Tab.Screen>
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search',
            tabBarIcon: ({focused, color, size}) => (
              <Search size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Profile"
          // component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({focused, color, size}) => (
              <User size={focused ? size + 2 : size} color={color} />
            ),
            headerShown: false,
          }}>
          {props => (
            <ProfileScreen {...props} bottomSheetRef={bottomSheetRef} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

const AppStack = () => {
  const bottomSheetRef = useRef(null);

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Tabs">
          {props => <TabNavigator {...props} bottomSheetRef={bottomSheetRef} />}
        </Stack.Screen>
        <Stack.Screen name="VisitProfile">
          {props => (
            <VisitProfileScreen {...props} bottomSheetRef={bottomSheetRef} />
          )}
        </Stack.Screen>
        <Stack.Screen name="EditProfile">
          {props => <EditProfileScreen />}
        </Stack.Screen>
        <Stack.Screen name="EditNametag">
          {props => <EditNametagScreen />}
        </Stack.Screen>
      </Stack.Navigator>

      {/* Bottom Sheet Component */}
      <AppBottomSheet ref={bottomSheetRef} />
    </>
  );
};

export default AppStack;

const styles = StyleSheet.create({});
