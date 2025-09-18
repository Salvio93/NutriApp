import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { padding: 20, marginTop:20, },
  label: { fontSize: 18, marginBottom: 10 },
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%',
  },
  input: {
    borderBottomWidth: 1, marginBottom: 10, padding: 5,
  },picker: {
    color: 'black',
    borderBlockColor: 'grey',
    width: '100%',
    marginBottom: 10,
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
});