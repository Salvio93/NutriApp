import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#252222ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft:50,
    color: '#fff',
  },

  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
    color: '#fff',
  },
  roundButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileButton: {
    backgroundColor: '#007AFF',
    padding: 5,
    borderRadius: 50, // circular
    position: 'absolute',
    top: -340,
    right: -125,
  },
});
