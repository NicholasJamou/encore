import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface FilterButtonProps {
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = memo(({ onPress }) => (
  <TouchableOpacity style={styles.filterButton} onPress={onPress}>
    <Text>Filter</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default FilterButton;