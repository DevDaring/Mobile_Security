/**
 * Privacy Guard App
 * Main application component with navigation setup
 */

import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAppStore} from './store';

// Screens
import {OnboardingScreen} from './screens/Onboarding/OnboardingScreen';
import {DashboardScreen} from './screens/Dashboard/DashboardScreen';
import {PermissionsManagerScreen} from './screens/PermissionsManager/PermissionsManagerScreen';
import {SocialAggregateScreen} from './screens/SocialAggregate/SocialAggregateScreen';
import {ComposerScreen} from './screens/Composer/ComposerScreen';
import {ExposureAnalyzerScreen} from './screens/ExposureAnalyzer/ExposureAnalyzerScreen';
import {AlertsScreen} from './screens/Alerts/AlertsScreen';
import {HistoryScreen} from './screens/History/HistoryScreen';
import {SettingsScreen} from './screens/Settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="PermissionsManager"
        component={PermissionsManagerScreen}
        options={{
          tabBarLabel: 'Permissions',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🔐</Text>,
          title: 'Permissions',
        }}
      />
      <Tab.Screen
        name="SocialAggregate"
        component={SocialAggregateScreen}
        options={{
          tabBarLabel: 'Social',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📱</Text>,
          title: 'Social Feed',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);
  const loadState = useAppStore(state => state.loadState);

  useEffect(() => {
    // Load persisted state on app start
    loadState().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    // In production, show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#FFFFFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}>
          {!hasCompletedOnboarding ? (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{headerShown: false}}
            />
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={MainTabNavigator}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Composer"
                component={ComposerScreen}
                options={{
                  title: 'Compose Post',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="ExposureAnalyzer"
                component={ExposureAnalyzerScreen}
                options={{
                  title: 'Privacy Scan',
                }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  title: 'Audit History',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
