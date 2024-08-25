import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface ActiveFilterProps {
  cityFilter: string;
  onClear: () => void;
}

const ActiveFilter: React.FC<ActiveFilterProps> = memo(({ cityFilter, onClear }) => (
  <View style={styles.activeFilterContainer}>
    <Text>Filtered by: {cityFilter}</Text>
    <TouchableOpacity onPress={onClear}>
      <Text style={styles.clearFilterText}>Clear</Text>
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  activeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e6e6e6',
  },
  clearFilterText: {
    color: 'blue',
  },
});

export default ActiveFilter;