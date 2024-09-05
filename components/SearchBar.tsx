import React, { memo } from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface SearchBarProps {
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = memo(({ onChangeText }) => (
  <TextInput
    style={styles.searchInput}
    placeholder="Search events..."
    placeholderTextColor="gray"
    onChangeText={onChangeText}
  />
));

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default SearchBar;
