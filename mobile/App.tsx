/**
 * Univo Mobile App - React Native
 * Next-Generation Video Conferencing with AI/ML Features
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';
import PushNotification from 'react-native-push-notification';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';

// Redux Store
import { store, persistor } from './src/store';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import BiometricAuthScreen from './src/screens/auth/BiometricAuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MeetingScreen from './src/screens/meeting/MeetingScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import JoinMeetingScreen from './src/screens/meeting/JoinMeetingScreen';
import MeetingRoomScreen from './src/screens/meeting/MeetingRoomScreen';
import RecordingsScreen from './src/screens/RecordingsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import MetaverseScreen from './src/screens/MetaverseScreen';
import BlockchainIdentityScreen from './src/screens/BlockchainIdentityScreen';
import QuantumSecurityScreen from './src/screens/QuantumSecurityScreen';
import NeuralInterfaceScreen from './src/screens/NeuralInterfaceScreen';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import TabBarIcon from './src/components/TabBarIcon';
import NetworkStatusBar from './src/components/NetworkStatusBar';

// Services
import { AuthService } from './src/services/AuthService';
import { WebRTCService } from './src/services/WebRTCService';
import { AIService } from './src/services/AIService';
import { BiometricService } from './src/services/BiometricService';
import { NotificationService } from './src/services/NotificationService';

// Utils
import { Colors } from './src/utils/Colors';
import { requestPermissions } from './src/utils/Permissions';
import { initializeApp } from './src/utils/AppInitializer';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon name={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Meeting" 
        component={MeetingScreen}
        options={{ title: 'Meet' }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Contacts' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="BiometricAuth" component={BiometricAuthScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      // Initialize app services
      await initializeApp();

      // Request permissions
      await requestPermissions();

      // Initialize device info
      const info = await DeviceInfo.getDeviceInfo();
      setDeviceInfo(info);

      // Initialize push notifications
      initializePushNotifications();

      // Initialize network monitoring
      initializeNetworkMonitoring();

      // Initialize WebRTC
      await WebRTCService.initialize();

      // Initialize AI services
      await AIService.initialize();

      // Initialize biometric authentication
      await BiometricService.initialize();

      // Check authentication status
      const authStatus = await AuthService.checkAuthStatus();
      setIsAuthenticated(authStatus);

      // Lock orientation for tablets, allow rotation for phones
      if (DeviceInfo.isTablet()) {
        Orientation.lockToLandscape();
      } else {
        Orientation.unlockAllOrientations();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Initialization Error', 'Failed to initialize the app. Please restart.');
      setIsLoading(false);
    }
  };

  const initializePushNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('Push notification token:', token);
        NotificationService.registerToken(token.token);
      },
      onNotification: function (notification) {
        console.log('Push notification received:', notification);
        NotificationService.handleNotification(notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  };

  const initializeNetworkMonitoring = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected ?? false);
      
      if (!state.isConnected) {
        Alert.alert(
          'Network Error',
          'No internet connection. Some features may not work properly.',
          [{ text: 'OK' }]
        );
      }
    });

    return unsubscribe;
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={isDarkMode ? Colors.dark : Colors.light}
            />
            
            <NetworkStatusBar isConnected={networkStatus} />
            
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                  <>
                    {/* Main App Screens */}
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="JoinMeeting" component={JoinMeetingScreen} />
                    <Stack.Screen 
                      name="MeetingRoom" 
                      component={MeetingRoomScreen}
                      options={{
                        gestureEnabled: false,
                        presentation: 'fullScreenModal',
                      }}
                    />
                    <Stack.Screen name="Recordings" component={RecordingsScreen} />
                    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                    <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
                    <Stack.Screen name="Metaverse" component={MetaverseScreen} />
                    <Stack.Screen name="BlockchainIdentity" component={BlockchainIdentityScreen} />
                    <Stack.Screen name="QuantumSecurity" component={QuantumSecurityScreen} />
                    <Stack.Screen name="NeuralInterface" component={NeuralInterfaceScreen} />
                  </>
                ) : (
                  <>
                    {/* Authentication Screens */}
                    <Stack.Screen name="Auth" component={AuthStackNavigator} />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
            
            {/* Keep screen awake during meetings */}
            <KeepAwake />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 90 : 70,
  },
});

export default App;